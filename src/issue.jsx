import { Component, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import parse from 'html-react-parser'
import IssueNavigation from './issue_navigation'
import 'bootstrap-icons/font/bootstrap-icons.scss'


const Page = (props) => {
    const [page_html, setPageHtml] = useState("")
	const [isLoading, setLoading] = useState(true)
	
	const url = `/issues/` + props.slug + `/` + props.file
	useEffect(() => {
		fetch(url)
			.then((res) => res.text())
			.then((data) => {
				setPageHtml(data)
				setLoading(false)
			})
	}, [])

	if (isLoading) return <>Loading...</>
	return <>
        <div>{parse(page_html)}</div>
    </>
}

class Spread extends Component {
    render() {
        return (
            <div data-scrollbar className="spread">
                <div className="header">
                    <h3>
                    <small><span className="from"><img src="/issues/paperology/from.png" /><br/>from {this.props.from}</span><span className="to"><img src="/issues/paperology/to.png" /><br/>to {this.props.to}</span></small>
       
                    <span className="title">{this.props.title}</span><br/>
                    <span className="author">{this.props.author}</span><br/>
                    <span className="location">{this.props.location}</span><br/>
                     </h3>
                </div>
                {this.props.page_left != null && 
                    <div className={"page page-left"}>
                        <Page 
                            file={this.props.page_left} 
                            slug={this.props.slug}
                        />
                    </div>
                }
                {this.props.page_right != null && 
                    <div className="page page-right">
                        <Page 
                            file={this.props.page_right} 
                            slug={this.props.slug}
                        />
                    </div>
                }
            </div>
        )            
    }
}

// EDIT: RECODED THIS FUNCTION TO WORK WITH THE NEW NAVIGATION SYSTEM.
// Now uses the navigation array to determine the correct slug for the active position so the active thumbnail corresponds to the current page.
function setActivePostion(left) {
    const issue = this.props.table_of_contents["issues"].filter(issue => issue["slug"] == this.props.slug)[0]
    const navigation = issue["navigation"]
    let current_nav = document.getElementsByClassName("nav-item active")[0]
    if (current_nav) {
        current_nav.classList.remove('active')
    }
    let position = Math.abs(left) / 100
    let slug = navigation[position]
    let link = document.getElementById("nav-item-" + slug)
    if (link) {
        link.classList.add("active")
    }
}

function getCurrentPostion(page_slug, spreads) {
    let positions = spreads.map((page, i) => {
        if (page.slug == page_slug) {
            return i
        }
        return null
    })
    let position = positions.filter((p, i) => {
        return p != null
    })
    return position[0]
} 

class Contents extends Component {
    
    // EDIT: ADDED THIS. The current position is now stored in state.
    constructor(props) {
        super(props);
        this.state = {
            currentPosition: 0,
            isSplitScreen: false,
            splitScreenDirection: null, // Track split screen direction
            previousPosition: null,  // Track the previous position
        };
    }

    // EDIT: MODIFIED THIS AND ADDED FUNCTIONS. Updated to work with the new state-based system.
    // I added methods like updateSpreadPosition(), updateActiveNavItem(), getCurrentSlug(), and navigatePage() to manage the page navigation.
    componentDidMount() {
        const ws = window.innerWidth;
        const wh = window.innerHeight;
        const spread_collection = document.getElementsByClassName("spread");
        for (let spread of spread_collection) {
            spread.style.width = ws + "px";
            spread.style.height = wh + "px";
        }

        // Check if there's a hash in the URL
        let reloaded_slug = window.location.hash.replace("#","");
        let position = 0;

        if (reloaded_slug) {
            position = this.props.navigation.indexOf(reloaded_slug);
            position = position >= 0 ? position : 0;
        } else {
            // If no hash, find the position of "A Commonplace Book for Uncommon Times"
            const firstPageSlug = this.props.navigation.find(slug => {
                const page = this.props.table_of_contents.issues
                    .find(issue => issue.slug === this.props.slug)
                    .articles.find(article => article.slug === slug);
                return page && page.title === "A Commonplace Book for Uncommon Times";
            });
            position = this.props.navigation.indexOf(firstPageSlug);
            position = position >= 0 ? position : 0;
        }

        this.setState({ currentPosition: position }, () => {
            this.updateSpreadPosition();
            window.location.hash = '#' + this.getCurrentSlug();
        });
    }

    updateSpreadPosition() {
        let left;
        if (this.state.isSplitScreen) {
            if (this.state.splitScreenDirection === 'next') {
                left = -(this.state.currentPosition * 100 + 50);
            } else {
                left = -(this.state.currentPosition * 100 - 50);
            }
        } else {
            left = -(this.state.currentPosition * 100);
        }
        document.getElementsByClassName("spreads")[0].style.left = left + "%";
        this.updateActiveNavItem();
    }

    updateActiveNavItem() {
        const thumbnails = document.getElementsByClassName("nav-item");
        for (let thumbnail of thumbnails) {
            thumbnail.classList.remove('active');
        }
        const activeNavItem = document.getElementById("nav-item-" + this.getCurrentSlug());
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }

    getCurrentSlug() {
        return this.props.navigation[this.state.currentPosition];
    }

    navigatePage(direction) {
        const navigation = this.props.navigation;

        if (this.state.isSplitScreen) {
            if (direction === this.state.splitScreenDirection) {
                // Complete the navigation
                let newIndex = direction === 'next' 
                    ? (this.state.currentPosition + 1) % navigation.length
                    : (this.state.currentPosition - 1 + navigation.length) % navigation.length;
                
                this.setState({ 
                    currentPosition: newIndex, 
                    isSplitScreen: false, 
                    splitScreenDirection: null,
                    previousPosition: null
                }, () => {
                    this.updateSpreadPosition();
                    window.location.hash = '#' + this.getCurrentSlug();
                });
            } else {
                // Go back to the original page
                this.setState({ 
                    currentPosition: this.state.previousPosition, 
                    isSplitScreen: false, 
                    splitScreenDirection: null,
                    previousPosition: null
                }, () => {
                    this.updateSpreadPosition();
                    window.location.hash = '#' + this.getCurrentSlug();
                });
            }
        } else {
            // Enter split-screen mode
            let nextIndex = direction === 'next'
                ? (this.state.currentPosition + 1) % navigation.length
                : (this.state.currentPosition - 1 + navigation.length) % navigation.length;
            
            this.setState({ 
                isSplitScreen: true, 
                splitScreenDirection: direction,
                previousPosition: this.state.currentPosition
            }, () => {
                this.updateSpreadPosition();
            });
        }
    }

    render() {
        const props = this.props;
        const issue = props.table_of_contents["issues"].find(issue => issue["slug"] === props.slug);

        if (!issue) return <></>;
    
        // EDIT: MODIFIED THIS. The component now uses the navigation prop for ordering, fixing the issue with the arrows navigating in the wrong order.
        const spreads = issue["articles"];
        const navigation = props.navigation;

        return (
            <>
                <div className="turn-pages">
                    
                    {/* EDIT: MODIFIED THIS */}
                    <a className="bi bi-chevron-left" onClick={() => this.navigatePage('prev')}></a>
                    <a className="bi bi-chevron-right" onClick={() => this.navigatePage('next')}></a>
                
                </div>

                <div className="spreads">
                    {/* EDIT: MODIFIED THIS */}
                    {navigation.map((slug, i) => {
                        const page = spreads.find(spread => spread.slug === slug);
                        const page_left = page.left == null ? null : page.left.file;
                        const page_right = page.right == null ? null : page.right.file;
                        return (
                            <div key={i} className="spread-container" id={"spread-" + page.slug}>
                                <Spread
                                    slug={props.slug} 
                                    title={page.title} 
                                    location={page.location} 
                                    author={page.author}
                                    from={page.from} 
                                    to={page.to} 
                                    page_left={page_left}
                                    page_right={page_right}
                                />
                            </div>
                        );
                    })}
                </div>
                {/* EDIT: MODIFIED THIS. onNavigate prop added to handle navigation from thumbnails and update state. (So thumbnail position and arrows correspond.) */}
                <IssueNavigation navigation={navigation} spreads={spreads} issue_slug={props.slug} onNavigate={(position, isSplitScreen) => this.setState({ currentPosition: position, isSplitScreen, splitScreenDirection: null }, this.updateSpreadPosition)}
                />
            </>
        );   
    }
}

export default function Issue(props) {
    const { slug } = useParams()
    let table_of_contents = undefined

    if (!props.table_of_contents) {
        table_of_contents = props.GetYaml()
        return <>Loading Issue, please wait.</>
    }
    else {
        table_of_contents = props.table_of_contents
    }

    // EDIT: ADDED THIS
    const issue = table_of_contents["issues"].find(issue => issue["slug"] === slug)
    if (!issue) return <>Issue not found.</>

    // EDIT: ADDED NAVIGATION PROP
    return (
        <Contents slug={slug} table_of_contents={table_of_contents} navigation={issue.navigation} 
        />
    )
}