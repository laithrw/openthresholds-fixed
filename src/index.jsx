import { useState, useEffect } from 'react'
import YAML from 'yaml'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Issue from './issue'


const TableOfContents = (props) => {
	const journal_title = props.table_of_contents["title"]
	const issues = props.table_of_contents["issues"]

	return (
		<div>
			<h1>{journal_title}</h1>
			<ul>
				{issues.map((issue, i) => {
					return (
						<li key={i}>
							<Link to={`/issue/${issue["slug"]}`}>{issue["title"]}</Link>
						</li>
					)
				})}
			</ul>
		</div>
	)
}

const GetYaml = () => {
	const [table_of_contents, setTableOfContents] = useState({})
	const [isLoading, setLoading] = useState(true)
	
	const url = `/thresholds.yml`
	useEffect(() => {
		fetch(url)
			.then((res) => res.text())
			.then((data) => {
				const table_of_contents_yml = YAML.parse(data)
				const table_of_contents_json = JSON.stringify(table_of_contents_yml, null, 4)
				setTableOfContents(JSON.parse(table_of_contents_json))
				setLoading(false)
			})
	}, [])

	if (isLoading) return undefined
	return table_of_contents
}

export default function App(props) {
	const table_of_contents = GetYaml()

	if (!table_of_contents) return <p>Loading, please wait.</p>

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<TableOfContents table_of_contents={table_of_contents} />} />
				<Route path="/issue/:slug" element={<Issue {...props} table_of_contents={table_of_contents} GetYaml={GetYaml} />} />
			</Routes>
		</BrowserRouter>
	)
}
