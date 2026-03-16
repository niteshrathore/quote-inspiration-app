import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

export async function POST(request) {
  try {
    const { quote, author, language, category, reaction, translation } = await request.json();

    const languageMap = { english: "English", hindi: "Hindi", sanskrit: "Sanskrit", urdu: "Urdu" };

    const properties = {
      Quote: { title: [{ text: { content: quote.substring(0, 2000) } }] },
      Language: { select: { name: languageMap[language] || language } },
      Category: { rich_text: [{ text: { content: category } }] },
      Author: { rich_text: [{ text: { content: author } }] },
      Reaction: { select: { name: reaction === "liked" ? "Liked" : reaction === "disliked" ? "Disliked" : "Neutral" } },
      "Date Added": { date: { start: new Date().toISOString().split("T")[0] } },
    };

    if (translation) {
      properties.Translation = { rich_text: [{ text: { content: translation } }] };
    }

    const response = await notion.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error("Notion API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
