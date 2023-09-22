import React from "react";
import { categories } from "./dataVisData";
import dataVisStyles from "./dataVisStyles";
import { withStyles } from "@material-ui/core";
import { Box, Typography } from "@material-ui/core";
import { SCREEN_SIZES } from "../../../../sharedUtilities/constants";
import DemographicGraph from "./demographicSection/DemographicGraph";
import FacilityCapacityGraph from "./facilityCapacitySection/FacilityCapacityGraph";

const DataVisContainer = ({ classes, screenSize, graphInfo, category }) => {
  return (
    <>
      <Box
        className={`${classes.graphInfoContainer} ${
          classes[`graphInfoContainer-${screenSize}`]
        }`}
      >
        <Typography
          variant="h3"
          className={`${classes.graphCategoryTitle} ${
            classes[`graphCategoryTitle-${screenSize}`]
          }`}
        >
          {graphInfo.title}
        </Typography>
        <Typography
          variant="body1"
          className={`${classes.graphCategoryDescription} ${
            classes[`graphCategoryDescription-${screenSize}`]
          }`}
        >
          {screenSize === SCREEN_SIZES.MOBILE
            ? graphInfo.mobile.description
            : graphInfo.notMobile.description}
        </Typography>
        <Box>
          {category === categories.demographic && (
            <DemographicGraph classes={classes} screenSize={screenSize} />
          )}
          {category === categories.facilityCapacity && (
            <FacilityCapacityGraph classes={classes} screenSize={screenSize} />
          )}
        </Box>
        <Typography
          variant="body1"
          className={`${classes.sourceText} ${
            classes[`sourceText-${screenSize}`]
          }`}
        >
          Source: Bureau of Justice Statistics, Federal Justice Statistics
          Program, 2021 (preliminary); US Census, 2022; and National Prisoner
          Statistics, 2021.
        </Typography>
      </Box>
    </>
  );
};

export default withStyles(dataVisStyles)(DataVisContainer);