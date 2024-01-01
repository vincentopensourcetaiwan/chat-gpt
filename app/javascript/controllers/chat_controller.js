import {Controller} from "@hotwired/stimulus"

// Connects to data-controller="chat"
export default class extends Controller {
  static targets = ["prompt", "conversation"]

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close()
    }
  }

  generateResponse(event) {
    // 1. Prevent the default form submission behavior
    event.preventDefault()

    this.#createLabel('You')

    // 2. Create a new <pre> element and append it to the conversation
    // the content of the <pre> element should be the prompt
    this.#createMessage(this.promptTarget.value)

    this.#createLabel('ChatGPT')

    // 3. Create a new <pre> element and append it to the conversation
    // the content of the <pre> element should be the response
    this.currentPre = this.#createMessage()

    // 4. setup event source
    this.#setupEventSource()

    this.promptTarget.value = ""
  }

  #createLabel(text) {
    const label = document.createElement('strong');
    label.innerHTML = `${text}:`;
    this.conversationTarget.appendChild(label);
  }

  #createMessage(text = '') {
    const preElement = document.createElement('pre');
    preElement.innerHTML = text;
    this.conversationTarget.appendChild(preElement);
    return preElement
  }

  #setupEventSource() {
    // 5. setup event source
    this.eventSource = new EventSource(`/chat_responses?prompt=${this.promptTarget.value}`)
    // 6. add event listeners
    this.eventSource.addEventListener("message", this.#handleMessage.bind(this))
    this.eventSource.addEventListener("error", this.#handleError.bind(this))
  }

  #handleMessage(event) {
    const parsedData = JSON.parse(event.data);
    this.currentPre.innerHTML += parsedData.message;

    // Scroll to bottom of conversation
    this.conversationTarget.scrollTop = this.conversationTarget.scrollHeight;
  }

  #handleError(event) {
    if (event.eventPhase === EventSource.CLOSED) {
      this.eventSource.close()
    }
  }
}
