import React from 'react';
import _ from 'lodash';
import createClass from 'create-react-class';
import Measure from 'react-measure';
import moment from 'moment-timezone';
import vis from 'vis';

import constants from '../constants';
import { debug } from '../../utils';

import 'vis/dist/vis.css';
import './Timeline.css';

const { ITEMS_CONTENT, ITEMS_TOOLTIP } = constants;
const { DataSet } = vis;

const log = debug();

const Timeline = createClass({
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
  componentWillMount() {
    this.dom = {
      timeline: null
    };
  },
  componentDidMount() {
    log('Rendering the "vis" timeline...');

    const { items, groups, options } = this.computeTimelineArgs();

    this.timeline = new vis.Timeline(this.dom.timeline, items, groups, options);
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

    const { timeline } = this;
    const { items, groups, options } = this.computeTimelineArgs();

    timeline.setItems(items);
    timeline.setGroups(groups);
    timeline.setOptions(options);
    timeline.fit({
      animation: {
        duration: 800,
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
        zoomMin: 60 * 60 * 1000,
        stack: true,
        locale: 'en',
        moment: date => moment(date).tz('Europe/Paris'),
        groupOrder: 'slug',
        timeAxis: {
          scale: 'minute',
          step: 15
        }
      },
      items: new DataSet(items.map(({ t, slug }, index) => ({
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
    return (
      <Measure onMeasure={ this.setDimensions }>
        <div
          className='Timeline'
          ref={ node => this.dom.timeline = node }
          style={ this.props.style } />
      </Measure>
    );
  }
});

module.exports = Timeline;
