import React from "react";
import { screen, render } from "@testing-library/react";
import PublicInfoBanner, { SUBTEXT, BUTTON_TEXT, BUTTON_URL } from "./PublicInfoBanner";
import { SCREEN_SIZES } from "../../../sharedUtilities/constants";

describe("Banner", () => {
    Object.values(SCREEN_SIZES).forEach(size => {
        test(`Expect Banner to contain text for ${size}`, () => {
            render(<PublicInfoBanner classes={{}} screenSize={size} />);
            expect(screen.getByText("for fairness, equality, and justice")).toBeInTheDocument;
        })
        test(`Expect Banner to contain subtext for ${size}`, () => {
            render(<PublicInfoBanner classes={{}} screenSize={size} />);
            expect(screen.getByText(SUBTEXT)).toBeInTheDocument;
        }) 
        test(`Expect Banner to contain button for ${size}`, () => {
            render(<PublicInfoBanner classes={{}} screenSize={size} />);
            expect(screen.getByText(BUTTON_TEXT)).toBeInTheDocument;
        })
    })
});