require('dotenv').load();

import _ from 'lodash';
import debug from 'debug';

const TIME_LOWER_BOUND = 0;
const TIME_UPPER_BOUND = 24;
const TIME_DEFAULT_INTERVAL = [TIME_LOWER_BOUND, TIME_UPPER_BOUND];

const COMPUTED_REGEXPS = [
  { id: 'TIME', type: 'SINCE', value: /^time_since_(.+)$/, check: checkTimeRule },
  { id: 'TIME', type: 'TO', value: /^time_to_(.+)$/, check: checkTimeRule }
];

function checkComputedRule(rule, context) {
  const { check } = rule.computed || {};

  return !(check instanceof Function) || check(rule, context);
}

function checkTimeRule(rule, context) {
  const origin = context[rule.computed.ref];

  return (origin >= 0 && origin < 24) || rule.operator !== '<';
}

function checkRule({ property, operator, operand }, value) {
  switch (operator) {
    case '>=':
      return value >= operand;
    case '<':
      return value < operand;
    case '[in[':
      return operand[0] < operand[1]
        ? value >= operand[0] && value < operand[1]
        : value >= operand[0] || value < operand[1];
    case 'is':
      return value === operand;
    default:
      debug('decisions')(`Unknown operator '${operator}' on property '${property}'`);
      return false;
  }
}

function groupConditionsByOperator(rules) {
  return rules.reduce((rules, { property, operator, operand }) => {
    if (!rules[property]) {
      rules[property] = {};
    }

    const rule = rules[property];

    if (!rule[operator]) {
      rule[operator] = [];
    }

    const conditions = rule[operator];

    // Check if conditions is already grouped
    if (Array.isArray(operand) && Array.isArray(operand[0])) {
      conditions.push(...operand);
    } else {
      conditions.push(operand);
    }

    return rules;
  }, {});
}

function computeTimeSinceEvents({ operand, operator }, eventTime) {
  const value = eventTime + operand / 3600;
  const interval = [value < 0 ? 0 : value, eventTime];

  return operator === '>=' ? interval : interval.reverse();
}

function computeTimeToEvents({ operand, operator }, eventTime) {
  const value = eventTime - operand / 3600;
  const interval = [value < 0 ? 0 : value, eventTime];

  return operator === '>=' ? interval.reverse() : interval;
}

function getOrientedIntervalsIntersection(intervals) {
  if (!intervals.length)  {
    return intervals;
  }

  return intervals.reduce((interval, current) => [
    Math.max(current[0], interval[0]),
    Math.min(current[1], interval[1])
  ], _.clone(TIME_DEFAULT_INTERVAL));
}

function expandComputedProperty(decisionRule) {
  const { property } = decisionRule;
  const regexp = COMPUTED_REGEXPS.find(({ value }) => value.test(property));

  if (regexp) {
    decisionRule = Object.assign({
      computed: Object.assign({ ref: property.match(regexp.value)[1] }, regexp)
    }, decisionRule);
  }

  return decisionRule;
}

function getIntervalsIntersection(conditions) {
  // Merging intervals with same orientation
  let [sorted, reversed] = _.partition(conditions, interval => interval[0] < interval[1])
    .map(getOrientedIntervalsIntersection);

  const [lowerSorted, upperSorted] = sorted;

  if (sorted.length && lowerSorted > upperSorted) {
    // Contradiction
    return;
  }

  if (!reversed.length) {
    return sorted.length ? [sorted] : undefined;
  }

  const [upperReversed, lowerReversed] = reversed;

  if (upperReversed < lowerReversed) {
    // Contradiction
    return;
  }

  if (!sorted.length) {
    sorted = _.clone(TIME_DEFAULT_INTERVAL);
  }

  const intervals = [];

  if (lowerReversed >= lowerSorted) {
    const interval = getOrientedIntervalsIntersection([sorted, [TIME_LOWER_BOUND, lowerReversed]]);

    if (interval.length) {
      intervals.push(interval);
    }
  }

  if (upperReversed < upperSorted) {
    const interval = getOrientedIntervalsIntersection([sorted, [upperReversed, TIME_UPPER_BOUND]]);

    if (interval.length) {
      intervals.push(interval);
    }
  }

  if (intervals.length) {
    return intervals;
  }
}

export function extractLeafs(tree, ...outputs) {
  const leafs = [];

  const traverse = (tree, rules = []) => {
    if (Array.isArray(tree)) {
      // `rules` must not be passed as a reference
      return tree.forEach(child => traverse(child, [...rules]));
    }

    const { predicted_value, children, decision_rule } = tree;

    if (decision_rule) {
      rules.push(expandComputedProperty(decision_rule));
    }

    if (children) {
      traverse(children, rules);
    } else if (predicted_value && outputs.includes(predicted_value)) {
      leafs.push({ rules, value: predicted_value, confidence: tree.confidence });
    }

    return leafs;
  };

  return traverse(tree).sort((a, b) => b.confidence - a.confidence);
}

export function filterLeafsByContext(leafs, context) {
  return leafs.reduce((leaves, leaf) => {
    const { removeLeaf, rules } = leaf.rules.reduce(({ removeLeaf, rules }, rule) => {
      if (removeLeaf) {
        return { removeLeaf };
      }

      const value = context[rule.property];

      if ((value === undefined && checkComputedRule(rule, context)) || value instanceof Function) {
        // Can't apply the rule, I keep it
        rules.push(rule);
        removeLeaf = false;
      } else {
        // Remove the leaf if rule is not checked
        removeLeaf = !checkRule(rule, value);
      }

      return { removeLeaf, rules };
    }, { removeLeaf: false, rules: [] });

    if (!removeLeaf) {
      // Update the rules, we only keep those we couldn't apply
      leaf.rules = rules;
      leaves.push(leaf);
    }

    return leaves;
  }, []);
}

export function computeEventsRelativeProperties(leafs, context) {
  return leafs.map(leaf => {
    let [eventsRelativeRules, rules] = _.partition(leaf.rules, rule => rule.computed && rule.computed.id === 'TIME');

    leaf.rules = Object
      .values(_.groupBy(eventsRelativeRules, 'property'))
      .reduce((rules, ruleGroup) => {
        const conditions = ruleGroup.reduce((conditions, rule) => {
          const { computed } = rule;
          const origin = context[computed.ref];

          if (origin >= 0 && origin < 24) {
            const computeInterval = computed.type === 'SINCE' ? computeTimeSinceEvents : computeTimeToEvents;

            conditions.push(computeInterval(rule, origin));
          }

          return conditions;
        }, []);

        const interval = getIntervalsIntersection(conditions);

        if (interval) {
          rules.push({ property: 'time', operator: '[in[', operand: interval });
        }

        return rules;
      }, rules);

    return leaf;
  });
}

export function computePartialDecisions(leafs, context) {
  return leafs.map(leaf => {
    leaf.rules = leaf.rules.reduce((rules, rule) => {
      const compute = context[rule.property];

      if (compute instanceof Function) {
        const value = compute(rule.operand);

        if (value && value.length) {
          rules.push(...value);
        }
      } else {
        rules.push(rule);
      }

      return rules;
    }, []);

    return leaf;
  });
}

export function getIntervalsUnion(intervals, precision = 0) {
  return intervals
    .sort(([a], [b]) => a - b)
    .reduce((intervals, current) => {
      const last = _.last(intervals);

      if (!last || current[0] - last[1] > precision) {
        intervals.push(current);
      } else {
        last[1] = current[1];
      }

      return intervals;
    }, []);
}

export function mergeRules(leafs) {
  return leafs.map(leaf => {
    let rules = groupConditionsByOperator(leaf.rules);

    // Merge conditions and filter out unsatisfied conditions
    rules = _.mapValues(rules, (rule, property) => {
      return _.mapValues(rule, (conditions, operator) => {
        switch (operator) {
          case '>=':
            return Math.max(...conditions);
          case '<':
            return Math.min(...conditions);
          case '[in[':
            return getIntervalsIntersection(conditions);
          default:
            debug('decisions')(`Unknown operator '${operator}' on property '${property}'`);
            return conditions;
        }
      });
    });

    leaf.rules = rules;

    return leaf;
  });
}

export function filterDeadLeafsAndRules(leafs) {
  return leafs.filter(leaf => {
    const rules = _.reduce(leaf.rules, (rules, rule, property) => {
      rule = _.reduce(rule, (rule, condition, operator) => {
        if (_.size(condition)) {
          rule[operator] = condition;
        }

        return rule;
      }, {});

      if (_.size(rule)) {
        rules[property] = rule;
      }

      return rules;
    }, {});

    leaf.rules = rules;

    return _.size(rules);
  });
}

export function expandContext(context, property, leaf) {
  const rules = _.reduce(leaf.rules, (rules, rule, property) => {
    _.forEach(rule, (operand, operator) => {
      if (Array.isArray(operand)) {
        operand.forEach(operand => rules.push({ property, operator, operand }));
      } else {
        rules.push({ property, operator, operand });
      }
    });

    return rules;
  }, []);

  return Object.assign(context, {
    [property](operand) {
      if (operand === leaf.value) {
        return rules;
      }
    }
  });
}
