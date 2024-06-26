---
title: Switch 开关
description:
type: 0
group: null
menuName: Switch
icon:
order: 51
---

## 基本用法

```schema: scope="body"
{
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "label": "开关",
            "option": "开关说明"
        }
    ]
}
```

## 禁用状态

```schema: scope="body"
{
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "disabled": true,
            "label": "开关",
            "option": "开关说明"
        }
    ]
}
```

## 配置真假值

默认情况：

- 开关打开时，表单项值为：true
- 开关关闭时，表单项值为：false

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "label": "开关"
        }
    ]
}
```

如果你想调整这个值，可以配置`trueValue`和`falseValue`

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "label": "开关",
            "trueValue": 1,
            "falseValue": 0
        }
    ]
}
```

调整开关，观察数据域变化，会发现打开后值为`1`，而关闭后为`0`

## 配置开启和关闭状态的文本

> `1.1.5` 版本之后支持

```schema: scope="body"
{
    "type": "form",
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "onText": "已开启飞行模式",
            "offText": "已关闭飞行模式"
        }
    ]
}
```

### 使用 Schema 配置文本

> `3.6.0` 版本之后支持

```schema: scope="body"
{
    "type": "form",
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "onText": [
                {
                    "type": "icon",
                    "icon": "fa fa-plane",
                    "vendor": "",
                    "className": "mr-1"
                },
                {
                    "type": "tpl",
                    "tpl": "飞行模式"
                }
            ],
            "offText": [
                {
                    "type": "icon",
                    "icon": "fa fa-plane",
                    "vendor": "",
                    "className": "mr-1"
                },
                {
                    "type": "tpl",
                    "tpl": "飞行模式"
                }
            ]
        }
    ]
}
```

## 默认值

和其它表单项一样，如果要设置默认值，可以使用 value 属性

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "label": "开关",
            "value": false
        }
    ]
}
```

## 不同尺寸

> `2.0.0` 及以上版本

```schema: scope="body"
{
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "body": [
        {
            "name": "switch",
            "type": "switch",
            "label": ""
        },
        {
            "name": "switch-sm",
            "type": "switch",
            "label": "",
            "size": "sm"
        }
    ]
}
```

## 加载状态

> `3.6.0` 及以上版本

设置`"loading": true`, 标识开关操作的异步任务仍在执行中。另外`loadingOn`支持表达式

```schema: scope="body"
{
    "type": "form",
    "api": "/api/mock2/form/saveForm",
    "data": {
        "shouldLoading": true
    },
    "body": [
        {
            "type": "switch",
            "name": "switch1",
            "label": "",
            "loading": true,
            "value": true
        },
        {

            "type": "switch",
            "name": "switch2",
            "label": "",
            "size": "sm",
            "disabled": true,
            "loading": true
        }
    ]
}
```

配合`ajax`动作，实现开关操作后台异步任务：

```schema: scope="body"
{
  "type": "page",
  "body": [
    {
      "type": "form",
      "id": "demo-form",
      "body": [
        {
            "type": "hidden",
            "name": "isFetching",
            "value": false
        },
        {
          "type": "switch",
          "name": "switch",
          "label": "操作状态开关",
          "mode": "horizontal",
          "loadingOn": "${isFetching}",
          "onEvent": {
            "change": {
              "actions": [
                {
                  "actionType": "toast",
                  "args": {
                    "msgType": "warning",
                    "msg": "任务${switch === true ? '派发' : '取消'}成功，等待后台操作..."
                  }
                },
                {
                  "actionType": "setValue",
                  "componentId": "demo-form",
                  "args": {
                    "value": {
                      "isFetching": true
                    }
                  }
                },
                {
                  "actionType": "ajax",
                  "api": {
                    "url": "/api/mock2/form/saveForm?waitSeconds=3",
                    "method": "get",
                    "messages": {
                      "success": "操作成功",
                      "failed": "操作失败"
                    }
                  }
                },
                {
                  "actionType": "setValue",
                  "componentId": "demo-form",
                  "args": {
                    "value": {
                      "isFetching": false
                    }
                  }
                }
              ]
            }
          }
        }
      ]
    }
  ]
}
```

## 属性表

除了支持 [普通表单项属性表](./formitem#%E5%B1%9E%E6%80%A7%E8%A1%A8) 中的配置以外，还支持下面一些配置

| 属性名     | 类型                                       | 默认值  | 说明                 | 版本               |
| ---------- | ------------------------------------------ | ------- | -------------------- | ------------------ |
| option     | `string`                                   |         | 选项说明             |
| onText     | `string \| IconSchema \| SchemaCollection` |         | 开启时开关显示的内容 | `3.6.0`支持 Schema |
| offText    | `string \| IconSchema \| SchemaCollection` |         | 关闭时开关显示的内容 | `3.6.0`支持 Schema |
| trueValue  | `boolean \| string \| number`              | `true`  | 标识真值             |
| falseValue | `boolean \| string \| number`              | `false` | 标识假值             |
| size       | `"sm" \| "md"`                             | `"md"`  | 开关大小             |
| loading    | `boolean`                                  | `false` | 是否处于加载状态     | `3.6.0`            |

IconSchema 配置
| 属性名 | 类型 | 默认值 | 说明 |
| ---------- | -------- | --------- | ------------ |
| type | `string` | | `icon` |
| icon | `string` | | icon 的类型 |

## 事件表

当前组件会对外派发以下事件，可以通过`onEvent`来监听这些事件，并通过`actions`来配置执行的动作，在`actions`中可以通过`${事件参数名}`或`${event.data.[事件参数名]}`来获取事件产生的数据，详细请查看[事件动作](../../docs/concepts/event-action)。

> `[name]`表示当前组件绑定的名称，即`name`属性，如果没有配置`name`属性，则通过`value`取值。

| 事件名称 | 事件参数                             | 说明             |
| -------- | ------------------------------------ | ---------------- |
| change   | `[name]: string \| boolean` 组件的值 | 开关值变化时触发 |

### change

switch 值更新时弹出确认提示，确认后发送请求。

```schema: scope="body"
{
    "type": "crud",
    "syncLocation": false,
    "api": "/api/mock2/sample",
    "columns": [
        {
            "name": "id",
            "label": "ID",
            "id": "u:daa79afa2e53"
        },
        {
            "name": "engine",
            "label": "Rendering engine",
            "id": "u:3343cf518656"
        },
        {
            "name": "browser",
            "label": "Browser",
            "id": "u:fbdc85e45e2f"
        },
        {
            "name": "platform",
            "label": "Platform(s)",
            "id": "u:ccdb48cc1804"
        },
        {
            "name": "switch",
            "label": "开关",
            "id": "u:30a36768acce",
            "type": "switch",
            "inline": true,
            "onEvent": {
                "change": {
                    "weight": 0,
                    "actions": [
                    {
                        "actionType": "confirmDialog",
                        "dialog": {
                        "type": "dialog",
                        "title": "弹框标题",
                        "body": [
                            {
                            "type": "tpl",
                            "tpl": "确定要修改${id}吗？",
                            "wrapperComponent": "",
                            "inline": false,
                            "id": "u:1965506c7599"
                            }
                        ],
                        "showCloseButton": true,
                        "showErrorMsg": true,
                        "showLoading": true,
                        "className": "app-popover",
                        "id": "u:d9783223df98",
                        "actions": [
                            {
                            "type": "button",
                            "actionType": "cancel",
                            "label": "取消",
                            "id": "u:302efee8613b"
                            },
                            {
                            "type": "button",
                            "actionType": "confirm",
                            "label": "确定",
                            "primary": true,
                            "id": "u:4a4d63cf35e1"
                            }
                        ]
                        }
                    },
                    {
                        "actionType": "ajax",
                        "outputVar": "responseResult",
                        "options": {
                        },
                        "api": {
                        "method": "get",
                        "url": "/api/mock2/form/saveForm"
                        }
                    }
                    ]
                }
            },
            "value": false
    }
    ],
    "id": "u:6c781a765f97"
}
```

## 动作表

当前组件对外暴露以下特性动作，其他组件可以通过指定`actionType: 动作名称`、`componentId: 该组件id`来触发这些动作，动作配置可以通过`args: {动作配置项名称: xxx}`来配置具体的参数，详细请查看[事件动作](../../docs/concepts/event-action#触发其他组件的动作)。

| 动作名称 | 动作配置                              | 说明                                                                   |
| -------- | ------------------------------------- | ---------------------------------------------------------------------- | --- |
| clear    | -                                     | 清空，6.3.1 及以上版本支持                                             |
| reset    | -                                     | 将值重置为初始值。6.3.0 及以下版本为`resetValue`，6.3.1 及以上版本支持 |     |
| setValue | `value: string \| boolean` 更新的数据 | 更新数据                                                               |

### clear

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "name": "switch",
            "label": "开关",
            "type": "switch",
            "id": "clear_text"
        },
        {
            "type": "button",
            "label": "清空",
            "onEvent": {
                "click": {
                    "actions": [
                        {
                            "actionType": "clear",
                            "componentId": "clear_text"
                        }
                    ]
                }
            }
        }
    ]
}
```

### reset

如果配置了`resetValue`，则重置时使用`resetValue`的值，否则使用初始值。

```schema: scope="body"
{
    "type": "form",
    "debug": true,
    "body": [
        {
            "name": "switch",
            "label": "开关",
            "type": "switch",
            "id": "reset_text",
            "value": true
        },
        {
            "type": "button",
            "label": "重置",
            "onEvent": {
                "click": {
                    "actions": [
                        {
                            "actionType": "reset",
                            "componentId": "reset_text"
                        }
                    ]
                }
            }
        }
    ]
}
```

### setValue

```schema: scope="body"
[
    {
      "type": "button",
      "label": "修改开关的值",
      "className": "mb-2",
      "onEvent": {
        "click": {
          "actions": [
            {
              "componentId": "u:6613bfa3a18e",
              "actionType": "setValue",
              "args": {
                "value": true
              }
            }
          ]
        }
      },
      "id": "u:9d7d695145bb"
    },
    {
      "type": "form",
      "title": "表单",
      "debug": true,
      "body": [
        {
          "label": "开启",
          "type": "switch",
          "name": "switch",
          "id": "u:6613bfa3a18e",
          "value": false,
          "mode": "inline"
        }
      ],
      "id": "u:82d44e407eb0",
      "actions": [
        {
          "type": "submit",
          "label": "提交",
          "primary": true
        }
      ]
    }
]
```
