const _ = require('lodash');
const React = require('react');
const createClass = require('create-react-class');
const { debug } = require('../../utils');
const {
  retrievePersonaDecisionTrees,
  createContext
} = require('../predictions');
const {
  extractLeafs,
  filterLeafsByContext,
  computeTimeSinceEvents,
  computeTimeToEvents,
  computePartialDecisions,
  mergeRules,
  filterDeadLeafsAndRules,
  getIntervalsUnion,
  expandContext
} = require('../decide');
const constants = require('../constants');
const Checkbox = require('./Checkbox');
const ListPicker = require('./ListPicker');
const PersonaPicker = require('./PersonaPicker');
const Timeline = require('./Timeline');

const { PERSONA, PROPERTIES, EVENTS, DAYS_OF_WEEK, MONTHS, MORNING_MEETING, VALUES, TIMESTAMPS } = constants;
const { HAPPENING, ON } = VALUES;

const MORNING_MEETING_KEYS = _.keys(MORNING_MEETING);
const MORNING_MEETING_VALUES = _.values(MORNING_MEETING);
const OUTPUTS = [HAPPENING, ON];

const log = debug();

function getTime(time) {
  const hours = Math.trunc(time);
  const result = new Date();

  result.setHours(hours, 60 * (time - hours), 0, 0);

  return result;
}

require('./App.css');

const App = createClass({
  getInitialState() {
    return {
      personas: PERSONA.map(name => ({ name, leafs: null })),
      items: null,
      selectedPersona: null,
      selectedDayOfWeek: 2,
      selectedMonth: 3,
      holiday: false,
      selectedMorningMeeting: 0
    };
  },
  componentWillMount() {
    // Trigger the retrieval of each persona trees
    this.state.personas.forEach(({ name }, index) => {
      const log = debug(`persona:${name}`);

      retrievePersonaDecisionTrees(name, TIMESTAMPS.DECEMBER)
      .then(trees => {
        const leafs = _.mapValues(trees, (tree, property) => extractLeafs(tree.trees[property], ...OUTPUTS));

        this.setState(_.set(this.state, `personas[${index}].leafs`, leafs));
      })
      .then(() => log('Persona ready'))
      .catch(err => log('Error while preparing persona', err));
    });
  },
  getItemsFromDecision() {
    const { selectedPersona, selectedMonth, selectedDayOfWeek, selectedMorningMeeting, personas, holiday } = this.state;
    const persona = personas.find(({ name }) => name === selectedPersona);

    if (!persona) {
      return;
    }

    const meeting = MORNING_MEETING_VALUES[selectedMorningMeeting];

    let context = createContext(2017, selectedMonth, selectedDayOfWeek);
    let items = [];

    context.holiday = VALUES[holiday];
    context.meeting = meeting;

    if (meeting > 0) {
      items.push({ slug: 'meeting', t: getTime(meeting) });
    }

    items = PROPERTIES.reduce((items, property) => {
      let leafs = _.cloneDeep(persona.leafs[property]);

      leafs = filterLeafsByContext(leafs, context);
      leafs = computeTimeSinceEvents(leafs, context);
      leafs = computeTimeToEvents(leafs, context);
      leafs = computePartialDecisions(leafs, context);
      leafs = mergeRules(leafs);
      leafs = filterDeadLeafsAndRules(leafs);

      const [leaf] = leafs;

      if (!leaf) {
        return items;
      }

      if (EVENTS.includes(property)) {
        const interval = leaf.rules.time && leaf.rules.time['[in['][0];

        if (interval) {
          const value = interval[0];

          context[property] = value;
          items.push({ slug: property, t: [getTime(value)] });
        }
      } else {
        context = expandContext(context, property, leaf);

        const intervals = leafs.reduce((intervals, current) => {
          const values = current.rules.time && current.rules.time['[in['];

          if (values) {
            intervals.push(...values.filter(interval => interval[0] < interval[1]));
          }

          return intervals;
        }, []);

        getIntervalsUnion(intervals).forEach(interval => {
          items.push({ slug: property, t: interval.map(getTime) });
        });
      }

      return items;
    }, items);

    this.setState({ items });
  },
  setSelectedPersona(persona) {
    log(`New selected persona is '${persona}'`);

    this.setState({ selectedPersona: persona }, this.getItemsFromDecision);
  },
  setSelectedDayOfWeek(dayOfWeek) {
    log(`New selected day of week is '${DAYS_OF_WEEK[dayOfWeek]}'`);

    this.setState({ selectedDayOfWeek: dayOfWeek }, this.getItemsFromDecision);
  },
  setSelectedMonth(month) {
    log(`New selected month is '${MONTHS[month]}'`);

    this.setState({ selectedMonth: month }, this.getItemsFromDecision);
  },
  setSelectedMorningMeeting(morningMeeting) {
    log(`New selected morningMeeting is '${MORNING_MEETING_KEYS[morningMeeting]}'`);

    this.setState({ selectedMorningMeeting: morningMeeting }, this.getItemsFromDecision);
  },
  setHoliday(holiday) {
    log(`New selected day is ${holiday ? '' : 'not '}a holiday`);

    this.setState({ holiday: holiday }, this.getItemsFromDecision);
  },
  render() {
    const { selectedPersona, selectedDayOfWeek, selectedMonth, selectedMorningMeeting } = this.state;

    return (
      <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch'
      }}>
        {
          this.state.items
            ? <Timeline
              items={ this.state.items }
              style={{
                flex: '0 0 425px'
              }} />
            : null
        }

        <div
          className='selector'
          style={{
            flex: '1 1',
            display: 'flex',
            flexDirection: 'row',
            paddingTop: this.state.items ? 0 : 80
          }}>
          <div
            style={{
              flex: '1 1 50%',
              padding: '10px 20px',
              overflowY: 'auto'
            }}>
            <h1>Choose a persona</h1>
            <PersonaPicker
              personas={ this.state.personas }
              selected={ selectedPersona }
              onSelectPersona={ this.setSelectedPersona } />
          </div>

          <div
            style={{
              flex: '1 1 50%',
              padding: '10px 30px',
              overflowX: 'hidden',
              overflowY: 'auto'
            }}>
            <h1>Set the context</h1>

            <h2>Day</h2>
            <ListPicker
              list={ DAYS_OF_WEEK }
              defaultValue={ selectedDayOfWeek }
              onSelect={ this.setSelectedDayOfWeek } />
            <Checkbox
              title='Bank holiday?'
              defaultValue={ this.state.holiday }
              onChange={ this.setHoliday } />

            <h2>Meeting</h2>
            <ListPicker
              list={ MORNING_MEETING_KEYS }
              defaultValue={ selectedMorningMeeting }
              onSelect={ this.setSelectedMorningMeeting } />

            <h2>Month</h2>
            <ListPicker
              list={ MONTHS }
              defaultValue={ selectedMonth }
              onSelect={ this.setSelectedMonth } />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = App;
