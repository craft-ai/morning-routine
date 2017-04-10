const learning_period         = 90 * 24 * 60 * 60;
const time_quantum            = 10 * 60;
const deactivate_sampling     = true;
const forgetting_max_quantums = 15000;
const forgetting_timestep     = 365 * 24 * 60 * 60;

module.exports = {
  door: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      month: { type: 'month_of_year' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_to_meeting: { type: 'continuous' },
      door: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['door']
  },
  garage: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      month: { type: 'month_of_year' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_to_meeting: { type: 'continuous' },
      garage: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['garage']
  },
  clock: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      month: { type: 'month_of_year' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_to_door: { type: 'continuous' },
      time_to_garage: { type: 'continuous' },
      time_to_meeting: { type: 'continuous' },
      clock: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['clock']
  },
  heater: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      month: { type: 'month_of_year' },
      time_to_clock: { type: 'continuous' },
      heater: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['heater']
  },
  coffee: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_since_clock: { type: 'continuous' },
      coffee: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['coffee']
  },
  toothbrush: {
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_since_clock: { type: 'continuous' },
      toothbrush: { type: 'enum' }
    },
    deactivate_sampling,
    forgetting_max_quantums,
    forgetting_timestep,
    output: ['toothbrush']
  },
  light: {
    learning_period,
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_since_clock: { type: 'continuous' },
      time_to_meeting: { type: 'continuous' },
      light: { type: 'enum' }
    },
    output: ['light']
  },
  tv: {
    learning_period,
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      time_since_clock: { type: 'continuous' },
      light: { type: 'enum' },
      tv: { type: 'enum' }
    },
    output: ['tv']
  },
  shower: {
    learning_period,
    time_quantum,
    context: {
      time: { type: 'time_of_day' },
      day_week: { type: 'day_of_week' },
      holiday: { type: 'enum' },
      timezone: { type: 'timezone' },
      light: { type: 'enum' },
      time_since_clock: { type: 'continuous' },
      shower: { type: 'enum' }
    },
    output: ['shower'],
    // Extended height for the tree to catch 'sparser' state
    tree_max_height: 10
  }
};
