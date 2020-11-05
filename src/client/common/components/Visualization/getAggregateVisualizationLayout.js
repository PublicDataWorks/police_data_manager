import { get, set, isEmpty } from 'lodash';
import { BAD_REQUEST_ERRORS } from '../../../../sharedUtilities/errorMessageConstants';
import {
  DATE_RANGE_TYPE,
  QUERY_TYPES
} from '../../../../sharedUtilities/constants';
import {
  COLORS,
  LABEL_FONT,
  TITLE_FONT,
  generateDonutCenterAnnotations,
  generateNoTagsLayout,
  generateYAxisRange
} from "./dataVizStyling";

export const FULL_LAYOUT = 'FULL_LAYOUT';

export const baseLayouts = {
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_INTAKE_SOURCE]: {
    showlegend: false,
    font: LABEL_FONT,
    height: 600,
    width: 800,
    title: {
      text: "Complaints by Intake Source",
      font: TITLE_FONT
    },
    margin: {
      t: 160
    }
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE]: {
    showlegend: false,
    font: LABEL_FONT,
    height: 600,
    width: 800,
    title: {
      text: "Complaints by Complainant Type",
      font: TITLE_FONT
    },
    margin: {
      t: 160
    }
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE_PAST_12_MONTHS]: {
    barmode: "group",
    font: LABEL_FONT,
    title: {
      text: "Complainant Type",
      font: TITLE_FONT
    }
  },
  [QUERY_TYPES.COUNT_TOP_10_TAGS]: {
    barmode: "group",
    xaxis: {
      showgrid: false,
      zeroline: false,
      automargin: true,
      showticklabels: false
    },
    margin: {
      l: 235,
      r: 0,
      b: 70,
      t: 130,
      pad: 8
    },
    font: LABEL_FONT,
    title: {
      text: "Top Tags",
      font: TITLE_FONT
    },
    width: 750
  }
};

export const extendedLayouts = {
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_INTAKE_SOURCE]: {
    height: 536,
    width: 806,
    title: null,
    margin: {
      b: 30,
      t: 30,
      l: 8,
      r: 8
    },
    paper_bgcolor: "#F5F4F4",
    plot_bgcolor: "#F5F4F4"
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE]: {
    height: 536,
    width: 806,
    title: null,
    margin: {
      b: 30,
      t: 30,
      l: 8,
      r: 8
    },
    paper_bgcolor: "#F5F4F4",
    plot_bgcolor: "#F5F4F4"
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE_PAST_12_MONTHS]: {
    title: null,
    width: 806,
    plot_bgcolor: "#F5F4F4",
    legend: {
      x: 0,
      y: -0.5
    },
    margin: {
      l: 24,
      r: 0,
      t: 8,
      b: 0
    }
  },
  [QUERY_TYPES.COUNT_TOP_10_TAGS]: {
    title: null,
    width: 806,
    margin: {
      b: 24,
      t: 24
    },
    paper_bgcolor: "#F5F4F4",
    plot_bgcolor: "#F5F4F4"
  }
};

export const dynamicLayoutProps = {
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_INTAKE_SOURCE]: {
    annotations: [generateDonutCenterAnnotations, 'data.0.count']
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE]: {
    annotations: [generateDonutCenterAnnotations, 'data.0.count']
  },
  [QUERY_TYPES.COUNT_TOP_10_TAGS]: {
    [FULL_LAYOUT]: [generateNoTagsLayout, 'data.0.x.length', 'data.0.y.length']
  },
  [QUERY_TYPES.COUNT_COMPLAINTS_BY_COMPLAINANT_TYPE_PAST_12_MONTHS]: {
    yaxis: [generateYAxisRange, 'data.8.maximum']
  }
};

export const subtitles = {
  [DATE_RANGE_TYPE.PAST_12_MONTHS]: 'Past 12 Months',
  [DATE_RANGE_TYPE.YTD]: 'Year-to-Date'
};

export const evaluateDynamicProps = (currentDynamicProps, newData) => {
  let currentDynamicLayout = {};
  
  Object.keys(currentDynamicProps).forEach(propName => {
    const [callback, ...params] = currentDynamicProps[propName];
    
    const allValues = params.map(paramName => get(newData, paramName, null));
    const extraProps = callback.apply(null, allValues);
    
    if (propName === FULL_LAYOUT) {
      currentDynamicLayout = { ...currentDynamicLayout, ...extraProps };
    } else {
      currentDynamicLayout[propName] = extraProps;
    }
  });

  return currentDynamicLayout;
}

export const getAggregateVisualizationLayout = ({
  queryType = null,
  queryOptions = {},
  isPublic = false,
  newData = {}
}) => {
  let aggregateLayout = get(baseLayouts, queryType, {});
  
  if (isEmpty(aggregateLayout)) {
    throw new Error(BAD_REQUEST_ERRORS.DATA_QUERY_TYPE_NOT_SUPPORTED);
  }
  
  const currentExtendedLayout = get(extendedLayouts, queryType, {});

  if (isPublic) {
    aggregateLayout = { ...aggregateLayout, ...currentExtendedLayout };
  }
  
  if (queryOptions.dateRangeType) {
    const currentTitle = get(aggregateLayout, ['title', 'text'], '');
    const currentSubtitle = subtitles[queryOptions.dateRangeType] || '';
    const newSubtitle = [currentTitle, currentSubtitle].join('<br><sub>');

    if (currentTitle) {
      const title = {
        text: newSubtitle,
        font: TITLE_FONT
      };
      
      aggregateLayout = {
        ...aggregateLayout,
        ...{ title }
      };
    }
  }

  const currentDynamicProps = get(dynamicLayoutProps, queryType, {});
  return { ...aggregateLayout, ...evaluateDynamicProps(currentDynamicProps, newData) };
};

