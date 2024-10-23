import { Component } from 'react'

function NavLink({page, issue_slug, page_slug, onClick}) {
    return (
        <a onClick={() => onClick(page_slug)}>
            {!page["thumbnail"] &&
                <>
                    {page["title"]}<br />
                </>
            }
            {page["thumbnail"] &&
                <img 
                    src={"/issues/" + issue_slug + "/" + page["thumbnail"]} 
                    alt={page["title"]} 
                />
            }
        </a>
    )
}

export default class IssueNavigation extends Component {
    // EDIT: Addded handleNavClick method
    handleNavClick = (page_slug) => {
        const position = this.props.navigation.indexOf(page_slug);
        document.getElementsByClassName("spreads")[0].style.left = "-" + (position * 100) + "%";
        window.location.hash = '#' + page_slug;

        const thumbnails = document.getElementsByClassName("nav-item");
        for (let thumbnail of thumbnails) {
            thumbnail.classList.remove('active');
        }
        const clickedNavItem = document.getElementById("nav-item-" + page_slug);
        if (clickedNavItem) {
            clickedNavItem.classList.add('active');
        }

        // EDIT: Added so parent component can update state when navigation occurs.
        if (this.props.onNavigate) {
            this.props.onNavigate(position, false);
        }
    }

    render() {
        if (!this.props.spreads) return <></>;
        return (
            <>
                <nav id="pages-menu" className="navbar navbar-expand">
                    <ul className="navbar-nav mr-auto">
                        {/* EDIT: Updated mapping logic. Simplified page finding process + ensure correct order.*/}
                        {this.props.navigation.map((slug, i) => {
                            const page = this.props.spreads.find(spread => spread.slug === slug);
                            return (
                                <li key={i} className="nav-item" id={"nav-item-" + slug}>
                                    <NavLink 
                                        page={page} 
                                        issue_slug={this.props.issue_slug} 
                                        page_slug={page.slug} 
                                        onClick={this.handleNavClick}
                                    />
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </>
        )   
    }
}