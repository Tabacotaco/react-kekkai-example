import React, { Component } from 'react';
import moment from 'moment';
import numeral from 'numeral';

import {
  KekkaiContainer, KekkaiDataview, KekkaiField, KekkaiDisplay, KekkaiEditor,
  LayoutOpts, TriggerOpts, EditingOpts,
  Todo, TodoScripts
} from 'react-kekkai';

import 'react-kekkai/dist/index.css';


export default class App extends Component {

  state = {
    panel: 'List',
    searchable: false
  };

  // TODO: Kekkai Todo - 定義資料可操作動作
  get todos() {
    return [];
  }

  // FIXME: 展示 <KekkaiContainer /> 可支援不同的 Layout 用
  onPanelChange = ({ target: { value } }) => {
    this.setState({ panel: value });
  };

  onSearch = () => this.setState({ searchable: true }, () =>
    // FIXME: 透過 ref 取得 <KekkaiContainer />, 並呼叫 method 執行查詢
    this.refs.budgetapply.doSearch()
  );

  getSearchResponse = () => [];

  onCommit = () => ({ success: true, msg: '' });

  render() {
    const { panel } = this.state;

    return (
      <div className="app">
        <header className="form-inline">
          <div className="form-group">
            <select className="form-control" value={panel} onChange={this.onPanelChange}>
              <option value="List">List 資料條列</option>
              <option value="Form">Form 單筆表單</option>
              <option value="Card">Card 多筆表單</option>
            </select>

            <button type="button" className="btn btn-primary" onClick={this.onSearch}>
              <i className="fa fa-search" /> Search
            </button>
          </div>
        </header>

        <hr />

        <KekkaiContainer ref="budgetapply" {...{
          panel: LayoutOpts[panel],
          toolBgColor: '#007bff',
          toolTxColor: 'white',
          pageSize: 'Form' === panel ? 1 : 10,
          todos: this.todos,
          getSearchResponse: this.getSearchResponse,
          onCommit: this.onCommit
        }} view={(data) => (
          <KekkaiDataview key={data.$uid} {...{
            dataModel: data,
            reorderable: true,
            selectable: true,
            labelSize: 4,
            viewSize: { sm: 6, lg: 4 }
          }}>
            <KekkaiField key="switch" align="center" locked={true} list={48} card={{ def: false }} form={{ def: false }}>
              <KekkaiDisplay>
                <button type="button" className="link-btn" onClick={() => data.$setEditable(!data.$editable)}>
                  <i className="fa fa-pencil" />
                </button>
              </KekkaiDisplay>
            </KekkaiField>

            <KekkaiField label="申請單號" name="applyNo" align="center" list={180} card={{ def: 6 }} {...{
              resizable: true,
              hideable: false,
              lockable: true,
              locked: true,
              sortable: { seq: 1, dir: 'asc' },
              ...(data.$isNew ? { form: { def: false } } : {})
            }}>
              {'string' !== typeof data.applyNo || data.applyNo.trim().length === 0 ? null : (
                <KekkaiDisplay>{data.applyNo} <i className="fa fa-link" style={{ marginLeft: 'auto' }} /></KekkaiDisplay>
              )}
            </KekkaiField>

            <KekkaiField label="金額" name="amount" align="right" form={{ def: 6 }} card={{ def: 6 }}>
              <KekkaiDisplay>{numeral(data.amount).format('0,0')}</KekkaiDisplay>

              <KekkaiEditor required={true} onChange={(name, value, dataModel) => console.log('on change', name, value, dataModel)}>
                <input type="number" />
              </KekkaiEditor>
            </KekkaiField>

            <KekkaiField label="申請人員" name="applyUser" filter="like" overflow={true} list={140} form={{ def: 6 }} card={{ def: 6 }}>
              <KekkaiEditor required={true} validation={(value, data) =>
                !value || value.length < 1 || value.length > 20 ? '申請人員僅允許輸入 1 ~ 20 個字碼.' : true
              }>
                <input type="text" />
              </KekkaiEditor>
            </KekkaiField>

            <KekkaiField label="原因說明" name="applyReason" overflow={true} resizable={true} form={{ def: 6 }} card={{ def: 6 }}>
              <KekkaiEditor editable={(value, data) =>
                'string' === typeof data.applyUser && data.applyUser.trim().length > 0
              }>
                <input type="text" />
              </KekkaiEditor>
            </KekkaiField>

            <KekkaiField label="申請日期" name="applyDate" overflow={true} form={{ def: 6 }} card={{ def: 6 }} />

            <KekkaiField label="申請單狀態" name="bpmState" lockable={true} list={140} sortable={true}>
              <KekkaiDisplay>
                {data.bpmState === 1 ? '執行中' : data.bpmState === 2 ? '辦理完畢'
                  : data.bpmState === 3 ? '結案' : '待確認'}
              </KekkaiDisplay>
            </KekkaiField>
          </KekkaiDataview>
        )} />
      </div>
    );
  }
}