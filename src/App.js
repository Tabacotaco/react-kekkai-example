import React, { Component } from 'react';
import moment from 'moment';
import numeral from 'numeral';

import { getBudgetData, doCommitBudget } from './service/service';

import {
  KekkaiContainer, KekkaiDataview, KekkaiField, KekkaiDisplay, KekkaiEditor,
  LayoutOpts, TriggerOpts, EditingOpts,
  Todo, TodoScripts
} from 'react-kekkai';

import 'react-kekkai/dist/index.css';


export default class App extends Component {
  static darkCSS = { background: '#343a40', color: '#fff', borderColor: '#fff' };
  static lightCSS = { background: '#f8f9fa', color: '#212529', borderColor: '#d6d8db' };

  static darkKekkai = { bgColor: '#ffc107', txColor: '#212529' };
  static lightKekkai = { bgColor: '#0069d9', txColor: '#fff' };

  state = {
    panel: 'List',
    darkMode: false,
    searchable: false
  };

  set mainTheme(value) {
    const $body = document.body;

    Object.keys(value).forEach(key => $body.style[key] = value[key]);
  }

  // TODO: Kekkai Todo - 定義資料可操作動作
  get todos() {
    return [
      TodoScripts.CREATE({
        concat: '新增',                  // <KekkaiContainer /> 會將相同設定之 Todo, 合併為下拉選單
        ref: 'CREATE_BUDGET',            // 建立動作專屬的 Ref, 在 <KekkaiContainer /> 的 onCommit 中可用於判斷資料
        icon: 'fa fa-plus',              // 按鈕圖示 class
        text: 'Inline Create',           // 按鈕顯示名稱
        editingMode: EditingOpts.INLINE, // 指定編輯模式 (EditingOpts.INLINE / *default: EditingOpts.POPUP)
        executable({ }, container) {
          return container.editings.filter(data => !data.$isNew).length === 0;
        },
        overrideParams() {               // 透過此 function 回傳新增資料的預設值 JSON
          return {
            applyNo: '', applyUser: '',
            amount: 0, applyReason: '',
            bpmState: 0,
            applyDate: moment(new Date()).format('YYYY-MM-DD')
          };
        },
        onSuccess(res) {                 // 注意!! 當設置為 EditingOpts.INLINE 時, 此事件將不會觸發
          console.log('Inline Create Commit Done.', res);
        }
      }),

      TodoScripts.CREATE({
        concat: '新增',
        ref: 'CREATE_BUDGET',
        icon: 'fa fa-plus-square',
        text: 'Popup Create',
        editingMode: EditingOpts.POPUP,
        executable({ }, container) {
          return container.editings.length === 0;
        },
        overrideParams() {
          return {
            applyNo: '', applyUser: '',
            amount: 0, applyReason: '',
            bpmState: 0,
            applyDate: moment(new Date()).format('YYYY-MM-DD')
          };
        },
        onSuccess(res) {
          console.log('Popup Create Commit Done.', res);
        }
      }),

      TodoScripts.UPDATE({
        concat: '編輯',
        ref: 'UPDATE_BUDGET',
        trigger: TriggerOpts.TOOLBAR,
        icon: 'fa fa-pencil-square-o',
        text: 'Inline Update',
        editingMode: EditingOpts.INLINE,
        executable({ }, container) {
          return container.editings.length === 0;
        },
        onSuccess(res) {
          console.log('Inline Update Commit Done.', res);
        }
      }),

      TodoScripts.UPDATE({
        concat: '編輯',
        ref: 'UPDATE_BUDGET',
        trigger: TriggerOpts.ROW_DBCLICK,
        icon: 'fa fa-pencil',
        text: 'Popup Update',
        editingMode: EditingOpts.POPUP,
        onSuccess(res) {
          console.log('Popup Update Commit Done.', res);
        }
      }),

      TodoScripts.DELETE({
        concat: '刪除',
        ref: 'DELETE_BUDGET',
        trigger: TriggerOpts.SELECTION,
        icon: 'fa fa-trash',
        text: 'Selection Delete'
      }),

      TodoScripts.DELETE({
        concat: '刪除',
        ref: 'DELETE_BUDGET',
        trigger: TriggerOpts.ROW_MENU,
        icon: 'fa fa-times',
        text: 'Menu Delete',
        confirmMsg: {
          type: 'info',
          icon: 'fa fa-question-circle',
          title: '資料即將被刪除',
          content: '確定刪除資料 ?'
        }
      })
    ];
  }

  // FIXME: 展示 <KekkaiContainer /> 可支援不同的 Layout 用
  onPanelChange = ({ target: { value } }) => {
    this.setState({ panel: value });
  };

  onModeChange = ({ target: { value } }) => {
    this.setState({ darkMode: 'dark' === value });
  };

  onSearch = () => this.setState({ searchable: true }, () =>
    // FIXME: 透過 ref 取得 <KekkaiContainer />, 並呼叫 method 執行查詢
    this.refs.budgetapply.doSearch()
  );

  getSearchResponse = async ({ filters = [], sort, page: { pageSize, skip } }) => {
    const { searchable = false } = this.state;

    if (!searchable)
      return [];
    else {
      const { content = [], totalCount = 0 } = await getBudgetData({
        conditions: { logic: 'and', filters },
        sorts: sort,
        pageSize,
        skipCount: skip
      });

      return { data: content, total: totalCount };
    }
  };

  onCommit = async (ref, { target, modifieds, removes }) => {
    switch (ref) {
      case 'UPDATE_BUDGET':
      case 'CREATE_BUDGET': return await doCommitBudget({ modifieds: [target].map(data => data.$json) });
      case 'DELETE_BUDGET': return await doCommitBudget({ removes: target.map(data => data.$json) });

      case KekkaiContainer.CommitAll: return await doCommitBudget({
        modifieds,
        removes
      });
    }
  };

  render() {
    const { panel, darkMode } = this.state;
    const mainCSS = App[darkMode ? 'darkCSS' : 'lightCSS'];
    const kekkaiCSS = App[darkMode ? 'darkKekkai' : 'lightKekkai'];

    this.mainTheme = mainCSS;

    return (
      <div className="app">
        <header className="form-inline">
          <div className="form-group">
            <select className="form-control mode" value={darkMode ? 'dark' : 'light'} onChange={this.onModeChange}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>

            <select className="form-control layout" value={panel} onChange={this.onPanelChange}>
              <option value="List">List 資料條列</option>
              <option value="Form">Form 單筆表單</option>
              <option value="Card">Card 多筆表單</option>
            </select>

            <button type="button" className="btn btn-primary" onClick={this.onSearch}>
              <i className="fa fa-search" /> Search
            </button>
          </div>
        </header>

        <hr style={{ borderColor: mainCSS.borderColor }} />

        <KekkaiContainer ref="budgetapply" {...{
          panel: LayoutOpts[panel],
          loadingMask: true,
          pageSize: 10,
          todos: this.todos,
          getSearchResponse: this.getSearchResponse,
          onCommit: this.onCommit,
          ...kekkaiCSS
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
                <input type="number" className="form-control" />
              </KekkaiEditor>
            </KekkaiField>

            <KekkaiField label="申請人員" name="applyUser" filter="like" overflow={true} list={140} form={{ def: 6 }} card={{ def: 6 }}>
              <KekkaiEditor required={true} validation={(value, data) =>
                !value || value.length < 1 || value.length > 20 ? '申請人員僅允許輸入 1 ~ 20 個字碼.' : true
              }>
                <input type="text" className="form-control" />
              </KekkaiEditor>
            </KekkaiField>

            <KekkaiField label="原因說明" name="applyReason" overflow={true} resizable={true} form={{ def: 6 }} card={{ def: 6 }}>
              <KekkaiEditor editable={(value, data) =>
                'string' === typeof data.applyUser && data.applyUser.trim().length > 0
              }>
                <input type="text" className="form-control" />
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