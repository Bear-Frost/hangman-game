type TLetters =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

class LettersChoice {
  public triggerLetter(
    letter: TLetters,
    currentLetterPlaceholderElement: HTMLDivElement,
  ) {
    const buttonLetterElement = document.getElementById(
      `button-letter-${letter}-element`,
    );

    if (buttonLetterElement === null) {
      console.warn(
        `couldn't find a button letter element with an id of button-letter-${letter}-element`,
      );
      return;
    }

    if (this.isButtonElement(buttonLetterElement)) {
      const isButtonLetterElementPicked =
        buttonLetterElement.getAttribute('data-active-state') === 'true';

      this.pickLetter(
        buttonLetterElement,
        currentLetterPlaceholderElement,
        !isButtonLetterElementPicked, // toggle the active state
      );
    }
  }

  private pickLetter(
    buttonLetterElement: HTMLButtonElement,
    currentLetterPlaceholderElement: HTMLDivElement,
    isButtonLetterElementPicked: boolean,
  ): void {
    const placeHolderLetterPosition =
      currentLetterPlaceholderElement.getBoundingClientRect();
    const buttonLetterPosition = buttonLetterElement.getBoundingClientRect();
    const newButtonLetterElementPosition = `${placeHolderLetterPosition.left - buttonLetterPosition.right}px,${placeHolderLetterPosition.top - buttonLetterPosition.top}px`;

    if (isButtonLetterElementPicked) {
      buttonLetterElement.style.transform = `translate(${newButtonLetterElementPosition})`;

      buttonLetterElement.setAttribute('data-active-state', 'false');
    } else {
      buttonLetterElement.style.transform = 'translate(0px)';

      buttonLetterElement.setAttribute('data-active-state', 'true');
    }
  }

  protected isButtonElement(
    element: HTMLElement | null,
  ): element is HTMLButtonElement {
    return element !== null && element instanceof HTMLButtonElement;
  }
}

export default LettersChoice;
