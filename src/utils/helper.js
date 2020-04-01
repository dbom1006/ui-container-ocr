import moment from 'moment';
import get from 'lodash/get';
import { round2 } from './utils';

export const converter = {
  convertFormToJob: ({
    date,
    start,
    end,
    unpaidBreak = 0,
    originRateHour,
    quantity,
    tipAmount = 0,
    tipTotal = 0,
    ...values
  }) => {
    if (!date || !start || !end) return {};
    date = moment(date);
    start = moment(start);
    end = moment(end);
    const startTime = moment(date)
      .hour(start.hour())
      .minute(start.minute())
      .second(0)
      .millisecond(0);
    const endTime = moment(date)
      .hour(end.hour())
      .minute(end.minute())
      .second(0)
      .millisecond(0);
    if (endTime.diff(startTime, 'minutes') / 60 - unpaidBreak <= 0) endTime.add(1, 'day');
    const duration = endTime.diff(startTime, 'minutes') / 60 - unpaidBreak;
    return {
      ...values,
      duration,
      startTime,
      endTime,
      unpaidBreak,
      originRateHour,
      quantity,
      tipAmount,
      tipTotal: tipTotal || round2(tipAmount * duration * quantity),
      originTotal: round2((originRateHour + tipAmount) * duration * quantity),
    };
  },
  convertJobToForm: ({ startTime, endTime, position, ...values }) => {
    if (!startTime || !endTime) return {};
    return {
      ...values,
      date: moment(startTime),
      start: moment(startTime),
      end: moment(endTime),
      position: get(position, '_id', position),
    };
  },
  convertFormToEvent: (eventModel, customer) => {
    const {
      jobs,
      data: { eventAddress, venueType, companyLocation, locationDetails = [], ...eventData },
      instructions: { positions, ...instructions },
    } = eventModel;
    const eventJobs = jobs.map(job => {
      const position = positions[job.position] || { attire: '', accessories: [] };
      return converter.convertFormToJob({
        ...job,
        attire: position.attire == 'Custom' ? position.attireCustom : position.attire,
        accessories: position.accessories.join(', '),
      });
    });
    return {
      ...eventData,
      address: eventAddress,
      locationDetails: locationDetails.join(', '),
      ...instructions,
      jobs: eventJobs,
      startTime: eventJobs.reduce((acc, cur) => {
        if (moment(cur.startTime).isBefore(acc)) return moment(cur.startTime);
        return moment(acc);
      }, moment().add(1, 'year')),
      endTime: eventJobs.reduce((acc, cur) => {
        if (moment(cur.endTime).isBefore(acc)) return moment(acc);
        return moment(cur.endTime);
      }, moment().subtract(1, 'year')),
      companyLocation,
      venueType: companyLocation ? 'Commercial' : venueType,
      totalPay: eventJobs.reduce((acc, cur) => acc + cur.originTotal, 0),
      user: customer._id,
      host: get(customer, 'company._id', customer.company),
    };
  },
  convertEventToForm: (
    {
      jobs,
      requiredAlcohol,
      contact,
      venueType,
      companyLocation,
      instructions,
      locationDetails = '',
      ...values
    },
    settingPositions = [],
  ) => {
    const positions = {};
    const formJobs = jobs.map(job => {
      const position = settingPositions.find(x => x.id == job.position.id) || {};
      const attireData = position.attireData || ['Black bistro', 'White Chef Coat'];
      positions[job.position.id] = {
        attire: attireData.includes(job.attire) ? job.attire : 'Custom',
        attireCustom: attireData.includes(job.attire) ? '' : job.attire,
        accessories:
          job.accessories &&
          job.accessories
            .split(',')
            .map(x => x.trim())
            .filter(Boolean),
      };
      return converter.convertJobToForm(job);
    });
    return {
      jobs: jobs.map(job => converter.convertJobToForm(job)),
      data: {
        ...values,
        venueType: companyLocation ? 'Commercial-ML' : venueType,
        companyLocation,
        locationDetails: locationDetails
          .split(',')
          .map(x => x.trim())
          .filter(Boolean),
      },
      instructions: {
        requiredAlcohol,
        contact: get(contact, '_id', contact),
        instructions,
        positions,
      },
    };
  },
};
