import { createMuiTheme } from "@material-ui/core/styles"

const Colors = {
	grey: "#777",
	white: "#fff",
	black: "#000",
	mattedBlack: "rgb(87, 99, 109)"
}

export default createMuiTheme({
	palette: {
		primary: { main: Colors.mattedBlack }
	},
	typography: {
		useNextVariants: true,
		allVariants: {
			color: Colors.mattedBlack
		}
	},
	overrides: {
		MuiToolbar: {
			root: {
				color: Colors.white
			}
		}
	}
})
