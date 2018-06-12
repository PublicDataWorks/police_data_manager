import {createMuiTheme} from "@material-ui/core/styles";
import styles from "./styles";

const muiTheme = createMuiTheme({
  palette: styles.colors,
  typography: {
    title: styles.title,
    subheading: styles.subheading,
    body1: styles.body1,
    caption: styles.caption,
    button: styles.button,
    display1: styles.display1,
    body2: styles.section
  }
});

export default muiTheme;
