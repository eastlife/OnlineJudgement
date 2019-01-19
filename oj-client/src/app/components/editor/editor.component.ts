import { Component, OnInit, Inject } from '@angular/core';

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

  constructor(@Inject('collaboration') private collaboration) {

  }

  ngOnInit() {
    this.initEditor();
  }

  initEditor(): void {
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/eclipse');
    // this.editor.session.setMode('ace/mode/java');
    // this.editor.setValue(this.defaultContent['Java']);
    this.editor.$blockScrolling = Infinity;
    this.resetEditor();
    this.collaboration.init();
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
    let userCode = this.editor.getValue();
    console.log(userCode);
  }

}
