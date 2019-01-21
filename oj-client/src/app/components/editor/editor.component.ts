import { Component, OnInit, Inject } from '@angular/core';

import { ActivatedRoute, Params } from '@angular/router';

declare var ace: any;

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;

  public languages: string[] = ['Java', 'C++', 'Python', 'JavaScript'];

  language = 'Java';

  sessionId: string;

  defaultContent = {
    'Java':
      `
public class Example {
  public static void main(String[] args) {
    // Type your code here
  }
}`,
    'C++':
      `
#include <iostream>
using namespace std;
int main() {
    //Type your code here
    return 0;
}`,
    'Python':
      `
class Solution:
  def example():
    #write your python code here
    `,
    'JavaScript':
      `
      function() {
        console.log("Hello");
      }
      `
  };

  modeMap = {
    'Java': 'java',
    'C++': 'c_cpp',
    'Python': 'python',
    'JavaScript': 'javascript'
  };

  constructor(@Inject('collaboration') private collaboration,
              private route: ActivatedRoute) {

  }

  ngOnInit() {
    this.route.params
      .subscribe(params => {
        this.sessionId = params['id'];
        this.initEditor();
      });
  }

  initEditor(): void {

    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/eclipse');
    // this.editor.session.setMode('ace/mode/java');
    // this.editor.setValue(this.defaultContent['Java']);
    this.resetEditor();
    this.editor.$blockScrolling = Infinity;

    document.getElementsByTagName('textarea')[0].focus();

    this.collaboration.init(this.editor, this.sessionId);
    this.editor.lastAppliedChange = null;

    this.editor.on('change', (e) => {
      console.log('editor changes: ' + JSON.stringify(e));
      if (this.editor.lastAppliedChange !== e) {
        this.collaboration.change(JSON.stringify(e));
      }
    });

    this.editor.getSession().getSelection().on('changeCursor', () => {
      const cursor = this.editor.getSession().getSelection().getCursor();
      console.log('cursor moves: ' + JSON.stringify(cursor));
      this.collaboration.cursorMove(JSON.stringify(cursor));
    });

    this.collaboration.restoreBuffer();
  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {
    console.log('ace/mode/' + this.modeMap[this.language]);
    this.editor.session.setMode('ace/mode/' + this.modeMap[this.language]);
    this.editor.setValue(this.defaultContent[this.language]);
  }

  submit(): void {
    const userCode = this.editor.getValue();
    console.log(userCode);
  }

}
