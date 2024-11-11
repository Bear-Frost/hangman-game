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

  private gameResult: string = '';

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
  private gameResultDialog = new GameResult();

  static isElementOfType<T extends HTMLElement>(
    element: HTMLElement | null,
    type: new () => T,
  ): element is T {
    return element !== null && element instanceof type;
  }

  private static isTwoWordsEqual(
    firstWord: string,
    secondWord: string,
  ): boolean {
    return (
      firstWord.toLowerCase().split('').sort().join('') ===
      secondWord.toLowerCase().split('').sort().join('')
    );
  }

  private static shuffleTipsAndAndswers(
    tipsAndAnswers: ITipAndAnswer[],
  ): ITipAndAnswer[] {
    for (let i = tipsAndAnswers.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [tipsAndAnswers[i], tipsAndAnswers[randomIndex]] = [
        tipsAndAnswers[randomIndex],
        tipsAndAnswers[i],
      ];
    }
    return tipsAndAnswers;
  }

  public async init(): Promise<void> {
    this.tipsAndAnswers = HangmanGame.shuffleTipsAndAndswers(
      await this.requestQuestions(),
    );

    this.currentTipAndAnswer =
      this.tipsAndAnswers[this.currentTipAndAnswerIndex];

    this.generateAllAnswerLetterPlaceholder();
    this.generateAllAvailableLettersElement();
    this.generateTipMessage();

    this.initPlayAgainEvent();
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
    const currentHangmanLifeElement = document.getElementById(
      `${this.STAGE_OF_HANGMAN_LIFE[this.currentStageOfHangManLife]}`,
    );

    if (
      HangmanGame.isElementOfType(currentHangmanLifeElement, HTMLImageElement)
    ) {
      currentHangmanLifeElement.setAttribute('data-active', 'true');
      currentHangmanLifeElement.style.display = 'block';
      this.currentStageOfHangManLife += 1;
    }
  }

  private checkIfPlayerWinOrLose(): void {
    if (this.currentStageOfHangManLife >= this.PLAYER_MAX_LIVES) {
      this.showGameResultState('lose');
    } else if (
      HangmanGame.isTwoWordsEqual(
        this.correctLettersChoices,
        this.currentTipAndAnswer.answer,
      )
    ) {
      this.showGameResultState('win');
    }
  }

  private showGameResultState(gameResultState: string) {
    this.gameResult = gameResultState;

    setTimeout(() => {
      this.gameResultDialog.showGameResultDialog(
        this.currentTipAndAnswer.answer,
        this.gameResult,
      );
    }, 300);
  }

  private nextTipAndAnswer(): void {
    if (this.currentTipAndAnswerIndex >= this.tipsAndAnswers.length - 1) {
      alert('you have guess all of the words');
      return;
    }

    this.currentTipAndAnswerIndex += 1;
    this.currentTipAndAnswer =
      this.tipsAndAnswers[this.currentTipAndAnswerIndex];

    this.correctLettersChoices = '';
    this.currentStageOfHangManLife = 0;

    const currentHangManLifeStageElements = document.querySelectorAll(
      'img[data-active="true"]',
    );

    currentHangManLifeStageElements.forEach(lifeStageImage => {
      (lifeStageImage as HTMLImageElement).style.display = 'none';
      lifeStageImage.setAttribute('data-active', 'false');
    });

    this.buttonLetterElement.unpickedButtonLetterElements();
    this.buttonLetterElement.enabledButtonLetterElements();
    this.placeholderLetterElement.clearPlaceholderLetterElementContainer();
    this.generateAllAnswerLetterPlaceholder();
    this.tipMessageElement.loadTipMessage(this.currentTipAndAnswer.tip);
    this.gameResultDialog.hideGameResultDialog();
  }

  private generateAllAvailableLettersElement(): void {
    for (const letter of this.availableLetters) {
      this.buttonLetterElement.createButtonLetterElement(letter, event =>
        this.pickLetter(event),
      );
    }
  }

  private generateAllAnswerLetterPlaceholder(): void {
    const correctAnswerLetters = this.currentTipAndAnswer.answer
      .toUpperCase()
      .split('');

    for (const letter of correctAnswerLetters) {
      this.placeholderLetterElement.createPlaceholderElement(letter);
    }
  }

  private generateTipMessage(): void {
    const tipMessage = this.currentTipAndAnswer.tip;

    this.tipMessageElement.loadTipMessage(tipMessage);
  }

  private initPlayAgainEvent() {
    const playAgainButton = document.getElementById(
      'play-again-button',
    ) as HTMLButtonElement;

    playAgainButton.addEventListener('click', () => this.nextTipAndAnswer());
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
  private buttonLetterElementContainer = document.getElementById(
    'letter-button-choices-container',
  ) as HTMLDivElement;

  public createButtonLetterElement(
    letter: string,
    clickHandler: (event: MouseEvent) => void,
  ): void {
    const buttonLetterElement = document.createElement('button');

    buttonLetterElement.setAttribute('id', `button-letter-${letter}-element`);
    buttonLetterElement.setAttribute('class', 'game__letter-choice');
    buttonLetterElement.setAttribute('data-letter', letter);
    buttonLetterElement.setAttribute('data-active', 'false');

    buttonLetterElement.textContent = letter;

    buttonLetterElement.addEventListener('click', clickHandler);

    this.buttonLetterElementContainer.append(buttonLetterElement);
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

      buttonLetterElement.setAttribute('data-active', 'true');

      this.toggleDisableButtonLetterElementState(letter, true);
    }
  }

  public unpickedButtonLetterElements(): void {
    const buttonLetterElement: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('button[data-active="true"]');

    buttonLetterElement.forEach(pickedButtonLetterElement => {
      pickedButtonLetterElement.style.transform = 'translate(0px,0px)';
      pickedButtonLetterElement.disabled = false;
      pickedButtonLetterElement.setAttribute('data-active', 'false');
    });
  }

  public enabledButtonLetterElements(): void {
    const disabledButtonLetterElements: NodeListOf<HTMLButtonElement> =
      document.querySelectorAll('button.game__letter-choice--uncorrect-letter');

    disabledButtonLetterElements.forEach(disabledLetterButton => {
      disabledLetterButton.classList.remove(
        'game__letter-choice--uncorrect-letter',
      );
      disabledLetterButton.disabled = false;
    });
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
          'game__letter-choice--uncorrect-letter',
        );
      } else {
        buttonLetterElement.classList.remove(
          'game__letter-choice--uncorrect-letter',
        );
      }
      return;
    }
  }
}

class PlaceholderLetterElement {
  private placeholderLetterElementContainer = document.getElementById(
    'letter-placeholder-container',
  ) as HTMLElement;

  public createPlaceholderElement(letter: string): void {
    const placeholderElementId = `placeholder-letter-${letter}-element`;
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

    this.placeholderLetterElementContainer.append(placeholderLetterElement);
  }

  public clearPlaceholderLetterElementContainer(): void {
    this.placeholderLetterElementContainer.replaceChildren();
  }
}

class TipElement {
  private tipMessageElement = document.getElementById(
    'tip-message-element',
  ) as HTMLParagraphElement;

  public loadTipMessage(tipMessage: string): void {
    this.tipMessageElement.textContent = tipMessage;
  }

  public clearTipMessage() {
    this.tipMessageElement.textContent = '';
  }
}

class GameResult {
  private gameDialogElement = document.getElementById(
    'game-result-dialog',
  ) as HTMLElement;

  private gameResultText = document.getElementById(
    'game-result-text',
  ) as HTMLSpanElement;

  private gameCorrectWordText = document.getElementById(
    'game-correct-word-text',
  ) as HTMLParagraphElement;

  public showGameResultDialog(correctWord: string, gameResult: string): void {
    const gameResultTextColor =
      gameResult === 'win' ? 'hsl(101, 58%, 44%)' : 'hsl(0, 58%, 44%)';

    this.gameDialogElement.style.display = 'flex';

    this.gameResultText.textContent = gameResult;
    this.gameResultText.style.color = gameResultTextColor;

    this.gameCorrectWordText.textContent = correctWord;
  }

  public hideGameResultDialog() {
    this.gameDialogElement.style.display = 'none';
  }
}

new HangmanGame().init();
