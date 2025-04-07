import React from "react";
import Link from "next/link";

function Nav(){
    return(
        <div>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link href="/" passHref legacyBehavior><span className="navbar-brand cursor-pointer">FHyCS</span></Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                    <li className="nav-item">
                    <Link href="/" passHref legacyBehavior><span className="navbar-brand cursor-pointer">Home</span></Link>
                    </li>
                    <li className="nav-item">
                    <Link href="/salones" passHref legacyBehavior><span className="navbar-brand cursor-pointer">Salones</span></Link>
                    </li>
                </ul>
                </div>
            </div>
            </nav>
        </div>
    );
}

export default Nav;