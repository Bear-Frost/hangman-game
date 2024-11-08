class Tip {
  public updateTipMessage(
    newTipMessage: string,
    tipMessageElementId: string = 'tip-message-element',
  ): void {
    const tipMessageElement = document.getElementById(tipMessageElementId);

    if (tipMessageElement === null) {
      console.warn(
        `couldn't find a tip message element with an id of ${tipMessageElementId}`,
      );
    }

    if (this.isParagraphElement(tipMessageElement)) {
      tipMessageElement.textContent = newTipMessage;
    }
  }

  protected isParagraphElement(
    element: HTMLElement | null,
  ): element is HTMLParagraphElement {
    return element !== null && element instanceof HTMLParagraphElement;
  }
}

export default Tip;
