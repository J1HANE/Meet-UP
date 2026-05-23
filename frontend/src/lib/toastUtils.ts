import type {
  ToastOptions,
  Id,
  UpdateOptions,
  ToastPromiseParams,
} from "react-toastify";
import { toast } from "react-toastify";

const defaultOptions: ToastOptions = {
  position: "bottom-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

type PromiseMessages = {
  pending: string;
  success: string | UpdateOptions;
  error: string | UpdateOptions;
};

export class ToastManager {
  static success(message: string, options?: ToastOptions): Id {
    return toast.success(message, { ...defaultOptions, ...options });
  }

  static error(message: string, options?: ToastOptions): Id {
    return toast.error(message, {
      ...defaultOptions,
      autoClose: 6000,
      ...options,
    });
  }

  static warning(message: string, options?: ToastOptions): Id {
    return toast.warning(message, { ...defaultOptions, ...options });
  }

  static info(message: string, options?: ToastOptions): Id {
    return toast.info(message, { ...defaultOptions, ...options });
  }

  static loading(message: string, options?: ToastOptions): Id {
    return toast.loading(message, {
      ...defaultOptions,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      ...options,
    });
  }

  static promise<T>(
    promise: Promise<T>,
    messages: PromiseMessages,
    options?: ToastOptions,
  ): Promise<T> {
    return toast.promise(promise, messages as ToastPromiseParams, {
      ...defaultOptions,
      ...options,
    }) as Promise<T>;
  }

  /**
   * Update an existing toast (e.g. resolve a loading toast).
   *
   * @example
   * const id = ToastManager.loading("Uploading...");
   * await upload();
   * ToastManager.update(id, { type: "success", render: "Upload complete!" });
   */
  static update(id: Id, options: UpdateOptions): void {
    toast.update(id, {
      autoClose: 4000,
      closeOnClick: true,
      ...options,
    });
  }

  static updateTask<T>(promise: Promise<T>): Promise<T> {
    return ToastManager.promise(promise, {
      pending: "Updating task...",
      success: "Task updated successfully.",
      error: "Failed to update task.",
    });
  }

  static createTask<T>(promise: Promise<T>): Promise<T> {
    return ToastManager.promise(promise, {
      pending: "Creating task...",
      success: "Task created successfully.",
      error: "Failed to create task.",
    });
  }

  static deleteTask<T>(promise: Promise<T>): Promise<T> {
    return ToastManager.promise(promise, {
      pending: "Deleting task...",
      success: "Task deleted successfully.",
      error: "Failed to delete task.",
    });
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  static created(entity: string): Id {
    return ToastManager.success(`${entity} created successfully.`);
  }

  static updated(entity: string): Id {
    return ToastManager.success(`${entity} updated successfully.`);
  }

  static deleted(entity: string): Id {
    return ToastManager.success(`${entity} deleted successfully.`);
  }

  static saved(): Id {
    return ToastManager.success("Changes saved.");
  }

  // ── Network / API ────────────────────────────────────────────────────────────

  static networkError(): Id {
    return ToastManager.error(
      "Network error. Please check your connection and try again.",
    );
  }

  static serverError(): Id {
    return ToastManager.error(
      "Something went wrong on our end. Please try again later.",
    );
  }

  static unauthorized(): Id {
    return ToastManager.error("You are not authorized to perform this action.");
  }

  static sessionExpired(): Id {
    return ToastManager.warning(
      "Your session has expired. Please sign in again.",
      { autoClose: false },
    );
  }

  static rateLimited(): Id {
    return ToastManager.warning(
      "Too many requests. Please slow down and try again.",
    );
  }

  // ── Auth ─────────────────────────────────────────────────────────────────────

  static loggedIn(name?: string): Id {
    return ToastManager.success(
      name ? `Welcome back, ${name}!` : "Signed in successfully.",
    );
  }

  static loggedOut(): Id {
    return ToastManager.info("You have been signed out.");
  }

  static passwordChanged(): Id {
    return ToastManager.success("Password changed successfully.");
  }

  static accountCreated(): Id {
    return ToastManager.success(
      "Account created! Please check your email to verify.",
    );
  }

  // ── Forms / Validation ───────────────────────────────────────────────────────

  static validationError(
    message = "Please fix the errors before continuing.",
  ): Id {
    return ToastManager.warning(message);
  }

  static formSubmitted(): Id {
    return ToastManager.success("Form submitted successfully.");
  }

  // ── Clipboard / UX ───────────────────────────────────────────────────────────

  static copied(label = "Link"): Id {
    return ToastManager.success(`${label} copied to clipboard.`, {
      autoClose: 2000,
    });
  }

  static comingSoon(): Id {
    return ToastManager.info("This feature is coming soon.");
  }

  // ── File / Upload ────────────────────────────────────────────────────────────

  static uploadSuccess(filename?: string): Id {
    return ToastManager.success(
      filename
        ? `"${filename}" uploaded successfully.`
        : "File uploaded successfully.",
    );
  }

  static uploadError(filename?: string): Id {
    return ToastManager.error(
      filename ? `Failed to upload "${filename}".` : "File upload failed.",
    );
  }

  static fileTooLarge(maxMb: number): Id {
    return ToastManager.warning(`File exceeds the ${maxMb}MB size limit.`);
  }

  static invalidFileType(accepted: string): Id {
    return ToastManager.warning(
      `Invalid file type. Accepted formats: ${accepted}.`,
    );
  }

  // ── Dismissal ────────────────────────────────────────────────────────────────

  static dismiss(id?: Id): void {
    toast.dismiss(id);
  }

  static dismissAll(): void {
    toast.dismiss();
  }
}
