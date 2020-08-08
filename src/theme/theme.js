import { createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles'
import theme_json from '../theme/theme.json'

let theme = createMuiTheme(theme_json)
theme = responsiveFontSizes(theme);

// node colors from https://coolors.co/f94144-f3722c-f8961e-f9c74f-90be6d-43aa8b-577590

export default theme