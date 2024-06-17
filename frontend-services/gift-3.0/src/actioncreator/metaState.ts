import { AppActions, LOAD_STATE_FROM_FILE, REDO, UNDO } from "../types/Actions/appActions";

/** Fuehre eine zuletzt rueckgaengig gemachte Action erneut aus*/
export function Redo():AppActions{
    return{ type:REDO}
}

/** Mache eine vorangegangene Action rueckgaengig*/
export function Undo():AppActions{
    return{ type:UNDO}
}





export function LoadStateFromFile(data: any): AppActions {
    return {
        type: LOAD_STATE_FROM_FILE,
        payload: data
    }
}



