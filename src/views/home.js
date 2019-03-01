import React from "react"
import { AppBar, Toolbar, Typography } from "@material-ui/core"

export default class Home extends React.Component {
	state = {
		episodes: []
	}
	componentDidMount() {
		fetch("http://onepiecetracklist.com/server/getstamps.php", {
			mode: "no-cors"
		})
			.then(r => r.json())
			.then(j => this.setState({ episodes: j }))
			.catch(() => ({}))
	}

	render() {
		const { episodes } = this.state
		return (
			<div>
				<AppBar position="static">
					<Toolbar>
						<Typography color="inherit" variant="h4">
							One Piece Track List
						</Typography>
					</Toolbar>
				</AppBar>
				{episodes.map(i => <div key={i.episode}>{i.episode}</div>)}
			</div>
		)
	}
}
