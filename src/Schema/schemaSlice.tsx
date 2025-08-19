import { createAsyncThunk, createSlice,  PayloadAction } from '@reduxjs/toolkit'
import { fetchPages, fetchComponentsByPage, addItem, deleteItem, editItem  } from './schemaService'
import { iSchemaField, iSchemaPage, iSchemaState } from '../types'


const emptyComponent: iSchemaField = {name:"", component:"", CType:"", page:"", description:"", max:0, order:0}
const emptyPage: iSchemaPage = {name:"", type:"", page:"", CType:"", description:"", max:20}
const noError = {status:false, titulo:"No Error", description:"No Error"}

const initialState : iSchemaState =  {
  pages: [],
  components: [],
  listComponents:[],
  subcomponents:[],
  selectedPage:{name:"", type:"", page:"", CType:"", description:"", max:20},
  deletingComponent:emptyComponent,
  selectedComponent: emptyComponent,
  error:  noError,
  loading: false
}

export const deletePageAction = createAsyncThunk("Schema/DeleteAction", async (payload: {page: string}) =>{
  const Page = {page:payload.page, component:payload.page }
  return(deleteItem(Page))
})

export const deleteComponentAction = createAsyncThunk("Schema/DeleteComponentAction", async (payload: {page: string, component: string}) =>{
  const component = {page:payload.page, component:payload.component}
  return(deleteItem(component))
})


export const loadSchemas = createAsyncThunk<iSchemaPage[]>("Schema/PagesLoad", fetchPages)
export const addPageAction = createAsyncThunk("Schema/AddPage", async (payload: any) =>{
    const page = payload
    return (addItem(page))
  })
  export const addComponentAction = createAsyncThunk("Schema/AddComponent", async (payload: any) =>{
    const component = payload
    return (addItem(component))
  })

  export const editComponentAction = createAsyncThunk("Schema/EditComponent", async (payload: any) =>{
    const component = payload
    return (editItem(component))
  })

export const selectSchema = createAsyncThunk("Schema/ComponentsLoad", async (payload: {page: string}) =>{
const res = await fetchComponentsByPage(payload.page)

return { components: res, "page": res.find((i) => i.CType == "page" || i.CType == "partial")}})


export const schemaSlice = createSlice({
  name: 'schema',
  initialState,
  reducers: {
    removeSchemaError: (state, _action )=>{
      state.error = noError
    },    addPage: (state, action : PayloadAction<iSchemaPage> ) => {
        state.pages.push(action.payload)
    },



    setDeletingComponent: (state,action: PayloadAction<iSchemaField>) =>{
      state.deletingComponent = action.payload
    },

    addSubcomponent: (state, action: PayloadAction<iSchemaField> ) => {
      state.subcomponents.push(action.payload)
  },
 
    selectComponent: (state, action) =>{
        state.selectedComponent = action.payload
    },
    clearPage: (state) =>{
      state.selectedPage = emptyPage
    }
  },
    extraReducers: (builder) => {
      builder.addCase(loadSchemas.fulfilled, (state, action) =>{
        state.pages = action.payload
        state.loading = false
      }),


      builder.addCase(loadSchemas.rejected, (state, action) =>{
        state.error= {status : true, titulo: action.error.name, description: action.error.stack }
        state.loading = false
      }),
      builder.addCase(loadSchemas.pending, (state, _action) =>{
        
        state.loading = true
      }),




      builder.addCase(selectSchema.fulfilled,(state,action) => {
        state.components = action.payload.components;
        state.selectedPage = action.payload.page;
        state.selectedComponent = emptyComponent;
        state.loading = false

    }),
    builder.addCase(selectSchema.rejected, (state, action) =>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
    }),
    builder.addCase(selectSchema.pending, (state, _action) =>{
      
      state.loading = true
    }),


    builder.addCase(addPageAction.fulfilled,(state,_action)=>{
      
      
      state.loading = false    }),

    builder.addCase(addPageAction.rejected, (state, action) =>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
    }),
    builder.addCase(addPageAction.pending, (state, _action) =>{
      
      state.loading = true
    }),

    builder.addCase(addComponentAction.fulfilled,(state,action)=>{
      const component = action.payload
      state.components.push(component)
      state.loading = false
      
    }),
    
    builder.addCase(addComponentAction.rejected, (state, action) =>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
    }),
    builder.addCase(addComponentAction.pending, (state, _action) =>{
      
      state.loading = true
    }),
    builder.addCase(editComponentAction.fulfilled,(state,action)=>{
      // const component = action.payload - removed unused variable

     state.components =[ ...state.components.filter(i => i.component != action.payload.component), action.payload  ]
     state.loading = false
      
    }),
    builder.addCase(editComponentAction.rejected,(state,action)=>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
      
    }),
    builder.addCase(editComponentAction.pending, (state, _action) =>{
      
      state.loading = true
    }),


    builder.addCase(deletePageAction.fulfilled,(state,action)=>{
      // const page = action.payload - removed unused variable
      state.error = noError
      // Fix: action.payload is the deleted page info, need to use correct property
      if (action.meta.arg && action.meta.arg.page) {
        state.pages = state.pages.filter((item) => item.name !== action.meta.arg.page)
      }
      state.selectedPage = emptyPage
      state.selectedComponent = emptyComponent
      state.loading = false
      
    }),

    builder.addCase(deletePageAction.rejected, (state, action) =>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
    }),
    builder.addCase(deletePageAction.pending, (state, _action) =>{
      
      state.loading = true
    }),

    builder.addCase(deleteComponentAction.fulfilled,(state,action)=>{
      // Handle component deletion - use meta.arg for original payload 
      if (action.meta.arg && action.meta.arg.component) {
        state.components = state.components.filter((item) => item.component !== action.meta.arg.component)
      }
      state.error = noError
      state.loading = false
      
    }),
    builder.addCase(deleteComponentAction.rejected, (state, action) =>{
      state.error= {status : true, titulo: action.error.name, description: action.error.stack }
      state.loading = false
    }),
    builder.addCase(deleteComponentAction.pending, (state, _action) =>{
      
      state.loading = true
    })



    }
})

// Action creators are generated for each case reducer function
export const { addPage, setDeletingComponent,  selectComponent,addSubcomponent, removeSchemaError,  clearPage } = schemaSlice.actions

export default schemaSlice.reducer

