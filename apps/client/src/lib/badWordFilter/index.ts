import fixedBadWords from './badWords.json';

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
}

class BadWordFilter {
  private root: TrieNode = new TrieNode();

  constructor(badWords: string[] = fixedBadWords) {
    this.buildTrie(badWords);
  }

  private buildTrie(words: string[]): void {
    for (const word of words) {
      let node = this.root;
      for (const char of word.toLowerCase()) {
        if (!node.children.has(char)) {
          node.children.set(char, new TrieNode());
        }
        node = node.children.get(char)!;
      }
      node.isEndOfWord = true;
    }
  }

  private searchFromNode(
    node: TrieNode,
    message: string,
    index: number
  ): boolean {
    if (node.isEndOfWord) return true;
    if (index === message.length) return false;

    const char = message[index];
    const nextNode = node.children.get(char);
    return nextNode ? this.searchFromNode(nextNode, message, index + 1) : false;
  }

  public isProfane(message: string): boolean {
    const lowercaseMessage = message.toLowerCase();
    for (let i = 0; i < lowercaseMessage.length; i++) {
      if (this.searchFromNode(this.root, lowercaseMessage, i)) {
        return true;
      }
    }
    return false;
  }

  public clean(message: string): string {
    const result: string[] = [];
    const lowercaseMessage = message.toLowerCase();

    for (let i = 0; i < message.length; i++) {
      let node = this.root;
      let matchLength = 0;
      let j = i;

      while (
        j < lowercaseMessage.length &&
        node.children.has(lowercaseMessage[j])
      ) {
        node = node.children.get(lowercaseMessage[j])!;
        j++;
        if (node.isEndOfWord) {
          matchLength = j - i;
        }
      }

      if (matchLength > 0) {
        result.push('*'.repeat(matchLength));
        i += matchLength - 1;
      } else {
        result.push(message[i]);
      }
    }

    return result.join('');
  }
}

export const badWordFilter = new BadWordFilter();
