interface ITipAndAnswer {
  tip: string;
  answer: string;
}

const LETTERS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const;

type TLetters = (typeof LETTERS)[number];

class HangmanGame {
  private tipsAndAnswers: ITipAndAnswer[] = [];

  private currentTipAndAnswerIndex: number = 0;
  private currentTipAndAnswer: ITipAndAnswer = { tip: '', answer: '' };

  private availableLetters: string[] = [...LETTERS];
  private correctLettersChoices: string = '';

  private currentStageOfHangManLife: number = 0;

  private readonly STAGE_OF_HANGMAN_LIFE = [
    'first-gallow-wood',
    'second-gallow-wood',
    'fourth-gallow-wood',
    'third-gallow-wood',
    'rope',
    'man-head',
    'man-body',
    'man-left-hand',
    'man-right-hand',
    'man-left-foot',
    'man-right-foot',
  ] as const;

  private readonly PLAYER_MAX_LIVES: number = this.STAGE_OF_HANGMAN_LIFE.length;

  private buttonLetterElement = new ButtonLetterElement();
  private placeholderLetterElement = new PlaceholderLetterElement();
  private tipMessageElement = new TipElement();

  static isElementOfType<T extends HTMLElement>(
    element: HTMLElement | null,
    type: new () => T,
  ): element is T {
    return element !== null && element instanceof type;
  }

  static isTwoWordsEqual(firstWord: string, secondWord: string): boolean {
    return (
      firstWord.toLowerCase().split('').sort().join('') ===
      secondWord.toLowerCase().split('').sort().join('')
    );
  }

  public async init(): Promise<void> {
    this.tipsAndAnswers = await this.requestQuestions();
    this.currentTipAndAnswer =
      this.tipsAndAnswers[this.currentTipAndAnswerIndex];

    this.generateAllAnswerLetterPlaceholder();
    this.generateAllAvailableLettersElement();
    this.generateTipMessage();
  }

  private async requestQuestions(): Promise<ITipAndAnswer[]> {
    try {
      const QUESTIONS_URL = '../../src/data/questions.json';
      const questionRequest = await fetch(QUESTIONS_URL);
      if (!questionRequest.ok) {
        throw new Error('failed fetching the questions');
      }
      const questionsResponse = await questionRequest.json();
      if (this.isValidTipsAndAnswers(questionsResponse)) {
        return questionsResponse as ITipAndAnswer[];
      } else {
        console.warn('Received data is not the exptected ITipsAndAnswers[]');
        return [];
      }
    } catch (error) {
      console.error((error as Error).message);
      return [];
    }
  }

  private pickLetter(event: MouseEvent): void {
    const letter = (event.target as HTMLButtonElement).getAttribute(
      'data-letter',
    ) as TLetters;

    const isPickedLetterCorrect = this.currentTipAndAnswer.answer
      .toUpperCase()
      .includes(letter);

    if (isPickedLetterCorrect) {
      this.correctLettersChoices += letter;
      this.moveLetterToPlaceholder(letter);
    } else {
      this.increaseCurrentStageOfHangmanLife();
      this.buttonLetterElement.toggleDisableButtonLetterElementState(
        letter,
        true,
      );
      this.buttonLetterElement.toggleInvalidLetterClass(letter, true);
    }

    this.checkIfPlayerWinOrLose();
  }

  private moveLetterToPlaceholder(letter: string): void {
    this.buttonLetterElement.pickedButtonLetterElement(letter);
  }

  private increaseCurrentStageOfHangmanLife() {
    const currentPartOfHangmanLifeElemnet = document.getElementById(
      `${this.STAGE_OF_HANGMAN_LIFE[this.currentStageOfHangManLife]}`,
    );

    if (
      HangmanGame.isElementOfType(
        currentPartOfHangmanLifeElemnet,
        HTMLImageElement,
      )
    ) {
      currentPartOfHangmanLifeElemnet.style.display = 'block';
      this.currentStageOfHangManLife += 1;
    }
  }

  private checkIfPlayerWinOrLose(): void {
    if (this.currentStageOfHangManLife >= this.PLAYER_MAX_LIVES) {
      alert('user just lose the game');
    } else if (
      HangmanGame.isTwoWordsEqual(
        this.correctLettersChoices,
        this.currentTipAndAnswer.answer,
      )
    ) {
      alert('the user just won the game');
    }
  }

  private generateAllAvailableLettersElement(): void {
    const buttonLetterElementContainer = document.getElementById(
      'letter-button-choices-container',
    );
    for (const letter of this.availableLetters) {
      if (
        HangmanGame.isElementOfType(buttonLetterElementContainer, HTMLElement)
      ) {
        const buttonLetterElementId = `button-letter-${letter}-element`;

        buttonLetterElementContainer.append(
          this.buttonLetterElement.createButtonLetterElement(
            buttonLetterElementId,
            letter,
            event => this.pickLetter(event),
          ),
        );
      }
    }
  }

  private generateAllAnswerLetterPlaceholder(): void {
    const correctAnswerLetters = this.currentTipAndAnswer.answer.split('');

    for (const letter of correctAnswerLetters) {
      const placeholderLetterElementContainer = document.getElementById(
        'letter-placeholder-container',
      );
      const placeholderLetterElementId = `placeholder-letter-${letter}-element`;
      if (
        HangmanGame.isElementOfType(
          placeholderLetterElementContainer,
          HTMLElement,
        )
      ) {
        placeholderLetterElementContainer.append(
          this.placeholderLetterElement.createPlaceholderElement(
            placeholderLetterElementId,
          ),
        );
      }
    }
  }

  private generateTipMessage(): void {
    const tipMessage = this.currentTipAndAnswer.tip;

    this.tipMessageElement.loadTipMessage(tipMessage);
  }

  private isValidTipsAndAnswers(items: unknown): items is ITipAndAnswer[] {
    if (Array.isArray(items)) {
      return items.every(
        (item: unknown) =>
          item && typeof item === 'object' && 'tip' in item && 'answer' in item,
      );
    }
    return false;
  }
}

class ButtonLetterElement {
  public createButtonLetterElement(
    buttonLetterElementId: string,
    buttonLetterElementText: string,
    clickHandler: (event: MouseEvent) => void,
  ): HTMLButtonElement {
    const buttonLetterElement = document.createElement('button');

    buttonLetterElement.setAttribute('id', buttonLetterElementId);
    buttonLetterElement.setAttribute('class', 'game__letter-choice');
    buttonLetterElement.setAttribute('data-letter', buttonLetterElementText);

    buttonLetterElement.textContent = buttonLetterElementText;

    buttonLetterElement.addEventListener('click', clickHandler);

    return buttonLetterElement;
  }

  public pickedButtonLetterElement(letter: string): void {
    const buttonLetterElement = document.getElementById(
      `button-letter-${letter}-element`,
    );
    const letterPlaceholderElement = document.getElementById(
      `placeholder-letter-${letter}-element`,
    );

    if (
      HangmanGame.isElementOfType(buttonLetterElement, HTMLButtonElement) &&
      HangmanGame.isElementOfType(letterPlaceholderElement, HTMLDivElement)
    ) {
      const buttonLetterElementPosition =
        buttonLetterElement.getBoundingClientRect();
      const letterPlaceholderElementPosition =
        letterPlaceholderElement.getBoundingClientRect();

      const buttonLetterElementTargetPosition = `${letterPlaceholderElementPosition.left - buttonLetterElementPosition.right + (letterPlaceholderElementPosition.width - 15)}px,${letterPlaceholderElementPosition.top - buttonLetterElementPosition.top - letterPlaceholderElementPosition.height}px`;

      buttonLetterElement.style.transform = `translate(${buttonLetterElementTargetPosition})`;

      this.toggleDisableButtonLetterElementState(letter, true);
    }
  }

  public unpickedButtonLetterElement(buttonLetterElementId: string): void {
    const buttonLetterElement = document.getElementById(buttonLetterElementId);
    if (HangmanGame.isElementOfType(buttonLetterElement, HTMLButtonElement)) {
      buttonLetterElement.style.transform = `translate(0px,0px)`;
      buttonLetterElement.disabled = false;
    }
  }

  public toggleDisableButtonLetterElementState(
    letter: string,
    disableState: boolean,
  ) {
    const buttonLetterElement = document.getElementById(
      `button-letter-${letter}-element`,
    );
    if (HangmanGame.isElementOfType(buttonLetterElement, HTMLButtonElement)) {
      buttonLetterElement.disabled = disableState;
      return;
    }
    console.warn(
      `Couldn't find a button letter element with an id of button-letter-${letter}-element`,
    );
  }

  public toggleInvalidLetterClass(letter: string, toggleState: boolean) {
    const buttonLetterElement = document.getElementById(
      `button-letter-${letter}-element`,
    );
    if (HangmanGame.isElementOfType(buttonLetterElement, HTMLButtonElement)) {
      if (toggleState) {
        buttonLetterElement.classList.add(
          'game__leter-choice--uncorrect-letter',
        );
      } else {
        buttonLetterElement.classList.remove(
          'game__leter-choice--uncorrect-letter',
        );
      }
      return;
    }
  }
}

class PlaceholderLetterElement {
  public createPlaceholderElement(
    placeholderElementId: string,
  ): HTMLDivElement {
    const placeholderLetterElement = document.createElement('div');
    const placeholderLetterUnderline = document.createElement('img');

    placeholderLetterElement.setAttribute('id', placeholderElementId);
    placeholderLetterElement.setAttribute('class', 'guess__letters');
    placeholderLetterElement.setAttribute(
      'data-letter-placeholder',
      placeholderElementId,
    );

    placeholderLetterUnderline.src =
      '../../src/assets/img/letter_underline.png';
    placeholderLetterUnderline.alt = '';
    placeholderLetterUnderline.height = 31;
    placeholderLetterUnderline.width = 50;

    placeholderLetterUnderline.setAttribute('aria-hidden', 'true');

    placeholderLetterElement.append(placeholderLetterUnderline);

    return placeholderLetterElement;
  }

  public clearPlaceholderLetterElementContainer(
    placeholderLetterContainer: HTMLElement,
  ): void {
    placeholderLetterContainer.replaceChildren();
  }
}

class TipElement {
  private tipMessageElement = document.getElementById('tip-message-element');

  public loadTipMessage(tipMessage: string): void {
    if (this.isParagraphElement(this.tipMessageElement)) {
      this.tipMessageElement.textContent = tipMessage;
    }
  }

  public clearTipMessage() {
    if (this.isParagraphElement(this.tipMessageElement)) {
      this.tipMessageElement.textContent = '';
    }
  }

  private isParagraphElement(
    element: HTMLElement | null,
  ): element is HTMLParagraphElement {
    return element !== null && element instanceof HTMLParagraphElement;
  }
}

new HangmanGame().init();
