class ChatResponsesController < ApplicationController
  include ActionController::Live

  def show
    response.headers['Content-Type'] = 'text/event-stream'
    response.headers['Last-Modified'] = Time.now.httpdate
    # handle message event
    sse = SSE.new(response.stream, event: "message")
    # connect to OpenAI API
    client = OpenAI::Client.new(access_token: ENV["OPENAI_ACCESS_TOKEN"])

    # send prompt to OpenAI API
    begin
      client.chat(
        parameters: {
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: params[:prompt] }],
          stream: proc do |chunk|
            content = chunk.dig("choices", 0, "delta", "content")
            if content.nil?
              return
            end
            # send response to client
            sse.write({ message: content })
          end
        }
      )
    ensure
      sse.close
    end
  end
end
