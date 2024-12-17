import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
  })
export class DarkModeService {
    isDarkMode: boolean;

    darkModeChange: Subject<boolean> = new Subject<boolean>();

    constructor()  {
        this.darkModeChange.subscribe((value) => {
            this.isDarkMode = value
        });
    }

    toggleDarkModeVisibility(darkMode) {
        this.isDarkMode = darkMode;
        this.darkModeChange.next(this.isDarkMode);
    }
}