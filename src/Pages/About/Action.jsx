import React from 'react'
import './Action.css'

function Action() {
    return (
        <section className="action-section">
            <div className="action-container">
                <div className="action-content">
                    <h2 className="action-title">Start your journey</h2>
                    <div className="action-buttons">
                        <button className="btn btn-primary">Find Talent / Work</button>
                        {/* <button className="btn btn-secondary"></button> */}
                    </div>
                </div>
                <div className="action-image">
                    <img
                        src="https://cdn.prod.website-files.com/603fea6471d9d8559d077603/68fa05699b52a99bf3d001ea_Visual%20(49).avif"
                        alt="Person working on computer"
                    />
                </div>
            </div>
        </section>
    )
}

export default Action