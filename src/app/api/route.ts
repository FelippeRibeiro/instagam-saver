import { NextResponse } from "next/server";
import cheerio from "cheerio";

export async function POST(request: Request) {
  const linksAndThumbs: { link: string; thumb: string }[] = [];
  const { link } = await request.json();

  const form = new FormData();
  form.append("q", link);
  form.append("t", process.env.T || "");
  form.append("lang", process.env.LANG || "");

  try {
    const query = await fetch(process.env.URL || "", {
      method: "POST",
      body: form,
      headers: {},
    });
    let response = await query.json();

    response = response.data;

    const $ = cheerio.load(response);

    // const links: string[] = [];
    // $("a").each((i, el) => {
    //   if (el.attribs.title == "Download Video" || el.attribs.title == "Download Photo") {
    //     links.push(el.attribs.href);
    //   }
    // });

    $(".download-items").each((i, el) => {
      const div = cheerio.load(el);
      const thumbEle = div(".download-items__thumb > img").attr();
      const link = div(".download-items__btn > a").attr()?.href;
      if (link)
        linksAndThumbs.push({
          thumb: thumbEle ? thumbEle["data-src"] || thumbEle["src"] : "",
          link,
        });
    });
  } catch (error) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }
  return NextResponse.json(linksAndThumbs);
}
