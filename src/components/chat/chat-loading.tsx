import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

export function ChatLoading() {
  return (
    <div className="chat-loading" role="status" aria-live="polite">
      <FontAwesomeIcon
        icon={faSpinner}
        className="chat-loading-spinner"
        aria-hidden="true"
      />
      <p>Loading conversation...</p>
    </div>
  );
}
