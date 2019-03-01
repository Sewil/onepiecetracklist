import React from "react"
import { AppBar, Toolbar, Typography } from "@material-ui/core"

export default class Navbar extends React.Component {
	render() {
		return (
			<AppBar position="static">
				<Toolbar>
					<Typography color="inherit" variant="h4">
						One Piece Track List
					</Typography>
				</Toolbar>
			</AppBar>
		)
	}
}
