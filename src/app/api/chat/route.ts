import { generateResponse } from "@/services/chat.service";

type ChatRequest = {
  message: string;
};

export async function POST(request: Request) {
  try {
    const body: ChatRequest = await request.json();

    const response = await generateResponse(body.message);

    return Response.json({
      response,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        error: "Something went wrong.",
      },
      {
        status: 500,
      },
    );
  }
}
