import React from "react"
import { BrowserRouter as Router, Route } from "react-router-dom"
import HttpsRedirect from "react-https-redirect"
import Home from "./views/home"
import { MuiThemeProvider } from "@material-ui/core"
import Theme from "./theme"

const App = () => (
	<Router>
		<Route render={() => (
			<HttpsRedirect>
				<MuiThemeProvider theme={Theme}>
					<Route exact path="/" component={Home} />
				</MuiThemeProvider>
			</HttpsRedirect>
		)} />
	</Router>
)

export default App
