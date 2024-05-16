import CountTop10Allegations from "./countTop10Allegations.model";
import { COLORS } from "../dataVizStyling";

describe("CountTop10Allegations model", () => {
  let model = new CountTop10Allegations();
  describe("data transformer", () => {
    test("should transform the rawData from the handler for the visualization component", () => {
      const rawData = [
        {
          rule: "Rule 1",
          paragraph: "description for Professionalism",
          count: "1"
        },
        {
          rule: "Rule 2",
          paragraph: "description for Unauthorized Force",
          count: "1"
        },
        {
          rule: "Rule 3",
          paragraph: "description for Workplace",
          count: "2"
        },
        {
          rule: "Rule 4",
          paragraph: "description for Arrest",
          count: "3"
        }
      ];

      const transformedData = model.transformData(rawData);

      const expectedTransformedData = {
        data: [
          {
            x: ["3"],
            y: ["Rule 4<br>description for Arrest"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: { color: "#002171" },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["2"],
            y: ["Rule 3<br>description for Workplace"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: { color: "#002171" },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 2<br>description for Unauthorized Force"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: { color: "#002171" },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 1<br>description for Professionalism"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: { color: "#002171" },
            textposition: "auto",
            textangle: 0
          }
        ]
      };

      expect(transformedData).toEqual(expectedTransformedData);
    });
    test("should display the rule and paragraph in the y value", () => {
      const rawData = [
        {
          rule: "Rule 1",
          paragraph: "description for Professionalism",
          count: "1"
        },
        {
          rule: "Rule 2",
          directive: "Unauthorized Force",
          paragraph: "description for Unauthorized Force",
          count: "1"
        },
        {
          rule: "Rule 3",
          directive: "Workplace",
          paragraph: "description for Workplace",
          count: "2"
        },
        {
          rule: "Rule 4",
          paragraph: "description for Arrest",
          count: "3"
        }
      ];

      const transformedData = model.transformData(rawData);

      const expectedTransformedData = {
        data: [
          {
            x: ["3"],
            y: ["Rule 4<br>description for Arrest"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["2"],
            y: ["Rule 3<br>description for Workplace"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 2<br>description for Unauthorized Force"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 1<br>description for Professionalism"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          }
        ]
      };

      const compareTransformedData = transformedData.data.every((trace, index) => { 
        return trace.y[0] === expectedTransformedData.data[index].y[0];
      }
      );
      expect(transformedData).toEqual(expectedTransformedData);
      expect(compareTransformedData).toBe(true);
    });

    test("should combine the count of the same rule and paragraph", () => {
      const rawData = [
        {
          rule: "Rule 1",
          paragraph: "description for Professionalism",
          count: "1"
        },
        {
          rule: "Rule 1",
          paragraph: "description for Professionalism",
          count: "1"
        }
      ];

      const transformedData = model.transformData(rawData);

      const expectedTransformedData = {
        data: [
          {
            x: ["2"],
            y: ["Rule 1<br>description for Professionalism"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          }
        ]
      };

      expect(transformedData).toEqual(expectedTransformedData);
    });

    test("should have x value as an array of count", () => {
      const rawData = [
        {
          rule: "Rule 1",
          paragraph: "description for Professionalism",
          count: "1"
        },
        {
          rule: "Rule 2",
          paragraph: "description for Unauthorized Force",
          count: "1"
        },
        {
          rule: "Rule 3",
          paragraph: "description for Workplace",
          count: "2"
        },
        {
          rule: "Rule 4",
          paragraph: "description for Arrest",
          count: "3"
        }
      ];

      const transformedData = model.transformData(rawData);

      const expectedTransformedData = {
        data: [
          {
            x: ["3"],
            y: ["Rule 4<br>description for Arrest"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["2"],
            y: ["Rule 3<br>description for Workplace"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 2<br>description for Unauthorized Force"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          },
          {
            x: ["1"],
            y: ["Rule 1<br>description for Professionalism"],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0
          }
        ]
      };

      const compareTransformedData = transformedData.data.every((trace, index) => { 
        return trace.x[0] === expectedTransformedData.data[index].x[0];
      }
      );
      expect(transformedData).toEqual(expectedTransformedData);
      expect(compareTransformedData).toBe(true);
    });

    test("should handle layout when no data is returned from backend", () => {
      const rawData = [];

      const transformedData = model.transformData(rawData);

      const expectedTransformedData = {
        data: [
          {
            x: [],
            y: [],
            type: "bar",
            width: 0.75,
            orientation: "h",
            marker: {
              color: COLORS[0]
            },
            textposition: "auto",
            textangle: 0,
          }
        ]
      };

      expect(transformedData).toEqual(expectedTransformedData);
    })
  });
});
