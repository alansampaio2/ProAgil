import { Component, OnInit, TemplateRef } from '@angular/core';
import { EventoService } from '../_services/evento.service';
import { Evento } from '../_models/Evento';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

// PARA DATEPICKER PT-BR
import { defineLocale, BsLocaleService, ptBrLocale } from 'ngx-bootstrap';
defineLocale('pt-br', ptBrLocale);

@Component({
  selector: 'app-eventos',
  templateUrl: './eventos.component.html',
  styleUrls: ['./eventos.component.css'],
  providers: [EventoService] // AQUI É UMA OUTRA MANEIRA DE REFERENCIAR O SERVIÇO E ULTILIZAR O
  // EVENTO SERVICE. A OUTAR FORMA ESTÁ NO ARQUIVO EVENTOSERVICE
})
export class EventosComponent implements OnInit {

  eventosFiltrados: Evento[];
  eventos: Evento[];
  evento: Evento;  // CRIADO PARA CADASTRO
  modoSalvar = 'post';
  imagemLargura = 50;
  imagemMargem = 2;
  mostrarImagem = false;
  // modalRef: BsModalRef;
  registerForm: FormGroup; // utilização do formulário
  bodyDeletarEvento = '';

  // tslint:disable-next-line:variable-name
  _filtroLista = '';

  constructor(
    private eventoService: EventoService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private localeService: BsLocaleService
    ) {
      this.localeService.use('pt-br');
    }

  get filtroLista(): string {
    return this._filtroLista;
  }
  set filtroLista(value: string) {
    this._filtroLista = value;
    this.eventosFiltrados = this.filtroLista ? this.filtrarEvento(this.filtroLista) : this.eventos;
  }

  ngOnInit() {    // O ngOnInit É CHAMADO ANTES DE CARREGAR O HTML
    this.validation();
    this.getEventos();
  }

  editarEvento(evento: Evento, template: any) {
    this.modoSalvar = 'put';
    this.openModal(template);
    // this.evento = Object.assign({}, evento);
    this.evento = evento;
    this.registerForm.patchValue(this.evento);
  }

  novoEvento(template: any) {
    this.modoSalvar = 'post';
    this.openModal(template);
  }

  excluirEvento(evento: Evento, template: any) {
    this.openModal(template);
    this.evento = evento;
    this.bodyDeletarEvento = `Tem certeza que deseja excluir o Evento: ${evento.tema}, Código: ${evento.id}`;
  }

  confirmeDelete(template: any) {
    this.eventoService.deleteEvento(this.evento.id).subscribe(
      () => {
          template.hide();
          this.getEventos();
        }, error => {
          console.log(error);
        }
    );
  }

  openModal(template: any) { // TemplateRef<any>) {
    // this.modalRef = this.modalService.show(template);
    this.registerForm.reset();
    template.show();
  }

  filtrarEvento(filtrarPor: string): Evento[] {
    filtrarPor = filtrarPor.toLocaleLowerCase();
    return this.eventos.filter(
      evento => evento.tema.toLocaleLowerCase().indexOf(filtrarPor) !== -1
    );
  }

  aleternarImagem() {
    this.mostrarImagem = !this.mostrarImagem;
  }

  getEventos() {
    this.eventoService.getAllEvento().subscribe((_eventos: Evento[]) => {
      this.eventos = _eventos;
      this.eventosFiltrados = this.eventos;
      console.log(_eventos);
    }, error => {
      console.log(error);
    });
  }

  salvarAlteracao(template: any) {
    if (this.registerForm.valid) {
      if (this.modoSalvar === 'post') {
        this.evento = Object.assign({}, this.registerForm.value);
        this.eventoService.postEvento(this.evento).subscribe(
          (novoEvento: Evento) => {
            template.hide();
            this.getEventos();
          }, error => {
            console.log(error);
          }
        );
      } else {
        this.evento = Object.assign({id: this.evento.id}, this.registerForm.value);
        this.eventoService.putEvento(this.evento).subscribe(
          () => {
            template.hide();
            this.getEventos();
          }, error => {
            console.log(error);
          }
        );
      }
    }
  }

  validation() {
    this.registerForm = this.fb.group({ // OBSERVAÇÃO:  TODOS OS CAMPOS DO FORMULÁRIO TEM QUE ESTÁ REPRESENTADOS AQUI
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      imagemURL: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.max(120000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  // editarEvento(evento: Evento, template: any) {
  //   this.modoSalvar = 'put';
  //   this.openModal(template); // ABRIR MEU MODAL PASSANDO MEU TEMPLATE
  //   this.evento = evento; // PASSO O EVENTO ATUAL PARA A MINHA VARIÁVEL evento (criada lá emcima)
  //   this.registerForm.patchValue(this.evento); // PASSOS OS DADOS PARA O FORMULÁRIO
  // }

}
