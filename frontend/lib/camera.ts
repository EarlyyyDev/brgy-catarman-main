/** Human-readable explanation for a getUserMedia() failure, keyed off the
 * actual DOMException name instead of a generic "permission" message --
 * "permission already granted but still failing" is almost always one of
 * these, not a permission problem. */
export function getCameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : undefined

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Camera permission was denied. Check your browser's site settings (and your OS camera privacy settings) and try again."
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No camera was found on this device."
    case "NotReadableError":
    case "TrackStartError":
      return "Your camera is already in use by another app or browser tab. Close it, then try again."
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "This device's camera doesn't support the requested mode. Try again -- we'll use any available camera."
    case "SecurityError":
    case "CameraApiUnavailable":
      return "Camera access needs a secure connection. This page was opened over plain HTTP from a phone/other device, and mobile browsers only allow camera access over HTTPS (or on the computer's own \"localhost\"). Open the site over HTTPS and try again."
    default:
      return "Unable to access camera. Please check your browser and device camera settings."
  }
}

/** Requests a camera stream with a preferred facingMode, falling back to any
 * available camera if that exact mode isn't supported (common on desktop
 * webcams, which often reject a "user"/"environment" facingMode outright). */
export async function requestCameraStream(facingMode: "user" | "environment"): Promise<MediaStream> {
  if (!navigator.mediaDevices?.getUserMedia) {
    // navigator.mediaDevices is only ever missing because the page isn't on
    // a secure origin (HTTPS, or "localhost" on desktop) -- NOT because
    // there's no camera. Mobile browsers give no exemption for LAN IPs.
    throw new DOMException("Camera API unavailable outside a secure context", "CameraApiUnavailable")
  }
  try {
    return await navigator.mediaDevices.getUserMedia({ video: { facingMode }, audio: false })
  } catch (err) {
    if (err instanceof DOMException && (err.name === "OverconstrainedError" || err.name === "ConstraintNotSatisfiedError")) {
      return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    }
    throw err
  }
}
