class HangmanFigure {
  private stageOfLifeIndex: number = 0;
  private readonly STAGE_OF_HANGMAN_LIVES: string[] = [
    'first-gallow-wood',
    'second-gallow-wood',
    'third-gallow-wood',
    'fourth-gallow-wood',
    'man-head',
    'man-body',
    'man-left-hand',
    'man-right-hand',
    'man-left-foot',
    'man-right-foot',
  ];
  private readonly MAX_LIVES: number = this.STAGE_OF_HANGMAN_LIVES.length;

  public decrementLife(): void {
    if (this.stageOfLifeIndex < this.MAX_LIVES - 1) {
      this.stageOfLifeIndex += 1;
      this.updateHangmanStageOfLife();
    }
  }

  private updateHangmanStageOfLife(): void {
    const hangmanCurrentStageOfLife =
      this.STAGE_OF_HANGMAN_LIVES[this.stageOfLifeIndex];

    const hangmanCurrentStageOfLifeElement = document.getElementById(
      hangmanCurrentStageOfLife,
    );

    if (hangmanCurrentStageOfLifeElement === null) {
      console.warn(
        `element with an id of ${hangmanCurrentStageOfLife} not found.`,
      );
    }

    if (this.isStageOfLifeElementAnImage(hangmanCurrentStageOfLifeElement)) {
      hangmanCurrentStageOfLifeElement.style.display = 'block';
    }
  }

  protected isStageOfLifeElementAnImage(
    stageOfLife: HTMLElement | null,
  ): stageOfLife is HTMLImageElement {
    return stageOfLife !== null && stageOfLife instanceof HTMLImageElement;
  }
}

export default HangmanFigure;
