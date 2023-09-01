import Home from "../page";

import React from "react";

export default function page({ params: { url } }: { params: { url: string } }) {
  return <Home URL={url}></Home>;
}
