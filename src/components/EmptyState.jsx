import React from "react";

export default function EmptyState({title, hint}){
    return(
        <>
            <h2>{title}</h2>
            <p>{hint}</p>
        </>
    );
}