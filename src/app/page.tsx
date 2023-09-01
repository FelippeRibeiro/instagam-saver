"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function Home({ URL = "" }: { URL?: string }) {
  const [url, setUrl] = useState(URL);
  const [results, setResult] = useState<{ link: string; thumb: string }[]>();
  const [isLoading, setIsLoading] = useState(false);
  async function handleDownload() {
    if (!url.length) {
      toast.error("Insira um URL!");
      return;
    }
    setIsLoading(true);
    setResult([]);
    const query = await fetch("/api", { body: JSON.stringify({ link: url }), method: "POST" });
    if (query.ok) {
      const result = await query.json();
      setResult(result);
      setUrl("");
    } else {
      toast.error("Erro ao buscar mídias.");
    }
    setIsLoading(false);
  }

  return (
    <>
      <div className="w-screen h-screen flex flex-col items-center ">
        <div className="w-full p-1 mb-4 flex items-center justify-center shadow-lg">
          <Image src={"/logo.png"} width={70} height={70} alt="logo"></Image>
          <h1 className="font-mono text-xl">IG Saver</h1>
        </div>
        <div className="w-[50%] flex flex-col items-center max-lg:w-[90%]">
          <input
            type="text"
            className="border p-2 rounded-md w-full"
            placeholder="Cole o link do post ou nome do usuario"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleDownload();
            }}
          />
          <button
            className="border bg-blue-400 px-5 py-2 rounded-md hover:bg-blue-500 m-2"
            onClick={() => handleDownload()}
          >
            Download
          </button>
        </div>
        {isLoading && <Image src={"/imgs/loader.gif"} width={50} height={50} alt="Loader"></Image>}
        {results && (
          <div className="grid grid-cols-5 mt-14 max-sm:grid-cols-2 max-lg:grid-cols-3 max-xl:grid-cols-4">
            {results.map((item) => {
              return (
                <div
                  className="m-2 rounded-md flex flex-col items-center bg-slate-200 hover:scale-105 border-b border-black shadow-sm shadow-black"
                  key={item.link}
                >
                  <Link href={item.link} target="_blank" className="flex flex-col items-center ">
                    <Image
                      src={item.thumb}
                      width={200}
                      height={300}
                      alt="item"
                      placeholder="blur"
                      blurDataURL="/logo.png"
                    ></Image>
                    <p className="">Download ⬇️</p>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
