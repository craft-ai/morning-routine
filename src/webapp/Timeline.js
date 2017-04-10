const _ = require('lodash');
const { debug } = require('../utils');
const Measure = require('react-measure');
const moment = require('moment-timezone');
const React = require('react');
const vis = require('vis');
const { ITEMS_CONTENT, ITEMS_TOOLTIP } = require('./constants');

require('vis/dist/vis.css');
require('./Timeline.css');

const log = debug();

const Timeline = React.createClass({
  getInitialState() {
    return {
      dimensions: {
        width: -1,
        height: -1
      }
    };
  },
  setDimensions(dimensions) {
    this.setState({
      dimensions
    });
  },
  componentDidMount() {
    log('Rendering the "vis" timeline...');
    const { items, groups, options } = this.computeTimelineArgs();
    this.timeline = new vis.Timeline(
      this.timelineDomElement,
      items,
      groups,
      options
    );
  },
  componentWillUnmount(dimensions) {
    this.timeline.destroy();
    this.timeline = null;
  },
  componentDidUpdate() {
    this.updateTimeline();
  },
  updateTimeline: _.throttle(function() {
    log('Updating the "vis" timeline...');
    const { items, groups, options } = this.computeTimelineArgs();
    this.timeline.setItems(items);
    this.timeline.setGroups(groups);
    this.timeline.setOptions(options);
    this.timeline.fit({
      animation: {
        duration: 1000,
        easingFunction: 'linear'
      }
    });
  }, 300),
  computeTimelineArgs() {
    const { dimensions } = this.state;
    const { items } = this.props;
    return {
      options: {
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        showMajorLabels: false,
        showCurrentTime: false,
        moveable: false,
        selectable: false,
        zoomMin: 60*60*1000,
        stack: true,
        locale: 'en',
        moment: date => moment(date).tz('Europe/Paris'),
        groupOrder: 'slug',
        timeAxis: {
          scale: 'minute',
          step: 15
        }
      },
      items: new vis.DataSet(items.map(({ t, slug }, index) => ({
        id: index,
        title: ITEMS_TOOLTIP[slug],
        content: ITEMS_CONTENT[slug] || slug,
        group: slug,
        className: slug,
        start: _.isArray(t) ? t[0] : t,
        end: _.isArray(t) ? t[1] : undefined
      }))),
      groups: _(items)
        .sortBy('slug')
        .sortedUniqBy('slug')
        .map(({ slug }) => ({
          id: slug,
          content: ''
        }))
        .value()
    };
  },
  render() {
    const { style } = this.props;
    return (
      <Measure onMeasure={ this.setDimensions }>
        <div
          className='Timeline'
          ref={ domElement => this.timelineDomElement = domElement }
          style={ style } />
      </Measure>
    );
  }
});

module.exports = Timeline;
