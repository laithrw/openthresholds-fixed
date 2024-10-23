import React, { useState, useEffect } from 'react'
import YAML from 'yaml'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
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
	const [table_of_contents, setTableOfContents] = useState(null)
	const [isLoading, setLoading] = useState(true)
	
	useEffect(() => {
		const url = `/thresholds.yml`
		fetch(url)
			.then((res) => res.text())
			.then((data) => {
				const table_of_contents_yml = YAML.parse(data)
				setTableOfContents(table_of_contents_yml)
				setLoading(false)
			})
	}, [])

	return { table_of_contents, isLoading }
}

export default function App(props) {
	const { table_of_contents, isLoading } = GetYaml()

	if (isLoading) return <p>Loading, please wait.</p>

	return (
		<Router>
			<Routes>
				<Route path="/" element={<TableOfContents table_of_contents={table_of_contents} />} />
				<Route path="/issue/:slug" element={<Issue table_of_contents={table_of_contents} GetYaml={GetYaml} />} />
				<Route path="/issue/:slug/:articleSlug" element={<Issue table_of_contents={table_of_contents} GetYaml={GetYaml} />} />
			</Routes>
		</Router>
	)
}
