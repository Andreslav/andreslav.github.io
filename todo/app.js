const store = new Vuex.Store({
	state: {
		toDoList: [{
			id: "16e7e822777",
			head: "О, чей-то список дел!",
			parent: true,
			list: [
			{
				type: "task",
				value: "Проснуться",
				checked: true,
				id: "16e7e82275e"
			},{
				type: "link",
				link: "16e7e8227ss",
				id: "1680e81b5c4",
			},{
				type: "task",
				value: "Поболтать с соседом",
				checked: false,
				id: "56e7e821684"
			},{
				type: "task",
				value: "Посидеть в ВКонтакте",
				checked: false,
				id: "16e7e821684"
			},{
				type: "task",
				value: "Почистить ковёр",
				checked: false,
				id: "16e7e81b5c4"
			},{
				type: "task",
				value: "Посмотреть Простоквашино",
				checked: false,
				id: "66e7e81b5c4"
			},
			]
		},{
			id: "16e7e8227ss",
			head: "Сходить за покупками",
			parent: false,
			list: [{
				type: "task",
				value: "Взять макароны",
				checked: false,
				id: "16e7888b5c4"
			},{
				type: "task",
				value: "Что-нибудь к чаю",
				checked: false,
				id: "16e7555b5c0"
			}],
		}],
		fixed: "16e7e822777",
		position: [],
		dark: matchMedia('(prefers-color-scheme: dark)').matches,
	},
	
	getters: {
		TODOS: (state, getters) => {
			let list
			
			if(state.position.length) {
				let position = state.position[state.position.length - 1]
				list = [getters.TODO_BY_ID(position)]
			} else {
				list = state.toDoList.filter(item => item.parent)
			}
			
			if(state.fixed) {
				list.sort((x, y) => x.id == state.fixed ? -1 : y.id == state.fixed ? 1 : 0)
			}
			
			list.forEach(({list}, i) => {
				list.forEach((e, i) => {
					if(e.type == "link") {
						let target = state.toDoList.find(t => t.id == e.link)
						
						e.value = target.head
						e.checked = getters.PROGRESS_TODOS([getters.TODO_BY_ID(e.link)]) == 1
					}
				})
			})
			
			return list
		},
		TODO_BY_ID: state => id => {
			return state.toDoList.find(todo => todo.id === id)
		},
		TODO_ITEM_BY_ID: (state, {TODO_BY_ID}) => (listid, id) => {
			return TODO_BY_ID(listid).list.find(todo => todo.id === id)
		},
		CREATE_ID: () => () => (~~(Math.random()*1e8)).toString(16),
		PROGRESS_TODOS: (state, {TODO_BY_ID}) => (todos) => {
			let count = (todos) => {
				return todos.reduce((c, e) => {
					c = e.list.reduce((cc, i) => {
						
						if(i.type == "link") {
							let {length, checked} = count([TODO_BY_ID(i.link)])
							
							cc.length += length
							cc.checked += checked
						} else {
							cc.length++
							cc.checked += ~~i.checked
						}

						return cc
					}, c)

					return c
				}, {checked:0, length:0})
			}
			
			let {checked, length} = count(todos)
			return length == 0 ? 0 : Math.ceil((checked / length) * 100) / 100
		},
	},
	
	mutations: {
		SET_TODO: (state, toDoList) => {
			state.toDoList = toDoList
		},
		
		SET_SCHEME: (state, scheme) => {
			state.dark = scheme
		},
		
		SET_FIXED: (state, fixed) => {
			state.fixed = fixed
		},
		
		SET_POSITION: (state, position) => {
			state.position.push(position)
		},
		
		BACK_POSITION: (state) => {
			state.position.pop()
		},

		ADD_TODO: (state, {todo, top = true}) => {
			if(top) {
				state.toDoList.unshift(todo)
			} else {
				state.toDoList.push(todo)
			}
		},
		
		ADD_TODO_ITEM: (state, {todo, newItem}) => {
			todo.list.unshift(newItem)
		},
		
		DELETE_TODO: (state, id) => {
			state.toDoList = state.toDoList.filter(item => item.id !== id)
		},
		
		UPDATE_TODO: (state, {todo, head = todo.head, parent = todo.parent, list = todo.list}) => {
			todo.head = head
			todo.list = list
			todo.parent = parent
		},
		
		UPDATE_TODO_ITEM: (state, {item, value = item.value, checked = item.checked, type = item.type}) => {
			item.value = value
			item.checked = checked
			item.type = type
		},
	},

	actions: {
		GET_DATA: async ({ commit }) => {
			let data = JSON.parse(sessionStorage.getItem('to-do-list'))
			if(data != null) commit('SET_TODO', data)

				let scheme = JSON.parse(sessionStorage.getItem('scheme'))
			if(scheme != null) commit('SET_SCHEME', scheme)

				let fixed = JSON.parse(sessionStorage.getItem('fixed'))
			if(fixed != null) commit('SET_FIXED', fixed)
		},


		// TODO
		
		SAVE_TODO: async ({ state }) => {
			console.log("SAVE_TODO", state.toDoList)
			sessionStorage.setItem('to-do-list', JSON.stringify(state.toDoList))
		},
		
		UPDATE_TODO: ({ commit, state, dispatch, getters }, newData) => {
			console.log("UPDATE_TODO")
			let todo = getters.TODO_BY_ID(newData.id)
			commit('UPDATE_TODO', Object.assign({todo}, newData))
			dispatch('SAVE_TODO')
		},
		
		UPDATE_TODO_ITEM: ({ commit, state, dispatch, getters }, newData) => {
			console.log("UPDATE_TODO_ITEM")
			let item = getters.TODO_ITEM_BY_ID(newData.listid, newData.id)
			commit('UPDATE_TODO_ITEM', Object.assign({item}, newData))
			dispatch('SAVE_TODO')
		},
		
		ADD_TODO: ({ commit, dispatch, getters }) => {
			let heads = [
			"Я это сделаю!",
			"Поставь цель и иди к ней!",
			"А вы целеустремлённый человек!",
			"Вперёд к цели!"
			]
			
			commit('ADD_TODO', {todo: {
				id: getters.CREATE_ID(),
				head: heads[Math.floor(Math.random() * heads.length)],
				parent: true,
				list: []
			}})
			
			dispatch('SAVE_TODO')
		},
		
		ADD_TODO_ITEM: ({ commit, state, dispatch, getters }, {listid, newItem}) => {
			console.log("ADD_TODO_ITEM")
			let todo = getters.TODO_BY_ID(listid)
			commit('ADD_TODO_ITEM', {todo, newItem})
			dispatch('SAVE_TODO')
		},
		
		DELETE_TODO_ITEM: async ({ commit, state, dispatch, getters }, {id, listid}) => {
			console.log("DELETE_TODO_ITEM")
			let todo = getters.TODO_BY_ID(listid)
			let list = todo.list.filter(item => {
				if(item.id === id) {
					if(item.type == "link") dispatch('DELETE_TODO', item.link)
						return false
				} else {
					return true
				}
			})
			commit('UPDATE_TODO', {todo, list});
			dispatch('SAVE_TODO')
		},
		
		DELETE_TODO: async ({ commit, dispatch, getters }, id) => {
			console.log("DELETE_TODO")
			let todo = getters.TODO_BY_ID(id)
			todo.list.forEach(item => {
				if(item.type == "link") dispatch('DELETE_TODO', item.link)
			})
			
			commit('DELETE_TODO',id)
			dispatch('SAVE_TODO')
		},
		
		TODO_ITEM_TO_LINK: ({ commit, state, dispatch, getters }, {id, listid}) => {
			console.log("TODO_ITEM_TO_LINK")
			let todo = getters.TODO_BY_ID(listid)
			let list = todo.list.map(item => {
				if(item.id == id) {
					let id = getters.CREATE_ID()
					
					commit('ADD_TODO', {todo: {
						id: id,
						head: item.value,
						parent: false,
						list: []
					}, top: false})
					
					return {
						type: "link",
						id: item.id,
						link: id
					}
				} else {
					return item
				}
			})
			
			commit('UPDATE_TODO', {todo, list})
			dispatch('SAVE_TODO')
		},
		
		TODO_ITEM_TO_TODO: ({ commit, state, dispatch, getters }, {id, listid}) => {
			console.log("TODO_ITEM_TO_TODO")
			let todo = getters.TODO_BY_ID(listid)
			let list = todo.list.filter(item => {
				if(item.id == id) {
					
					if(item.type == "link") {
						let to = getters.TODO_BY_ID(item.link)
						commit('UPDATE_TODO', {todo: to, parent: true})
					} else {
						commit('ADD_TODO', {todo: {
							id: getters.CREATE_ID(),
							head: item.value,
							parent: true,
							list: []
						}, top: false})
					}
					
					return false
				} else {
					return true
				}
			})
			
			commit('UPDATE_TODO', {todo, list})
			dispatch('SAVE_TODO')
		},
		
		TODO_ITEM_TO_TASK: ({ commit, state, dispatch, getters }, {id, listid}) => {
			console.log("TODO_ITEM_TO_TASK")
			let todo = getters.TODO_BY_ID(listid)
			let list = todo.list.flatMap(item => {
				if(item.id == id) {
					let to = getters.TODO_BY_ID(item.link)
					
					let arr = to.list.length ? [...to.list] : [{
						type: "task",
						value: item.value,
						checked: item.checked,
						id: item.id
					}]
					
					commit('DELETE_TODO', to.id)
					
					return arr
				} else {
					return item
				}
			})
			
			commit('UPDATE_TODO', {todo, list})
			dispatch('SAVE_TODO')
		},
		
		
		// FIXED
		
		SET_FIXED: ({ commit, dispatch }, fixed) => {
			commit('SET_FIXED', fixed)
			dispatch('SAVE_FIXED')
		},
		
		SAVE_FIXED: async ({ state }) => {
			sessionStorage.setItem('fixed', JSON.stringify(state.fixed))
		},
		
		
		// POSITION
		
		SET_POSITION: ({ commit }, link) => {
			commit('SET_POSITION', link)
		},
		
		BACK_POSITION: ({ commit }) => {
			commit('BACK_POSITION')
		},
		
		
		// SCHEME
		
		TOGGLE_SCHEME: async ({ commit, state, dispatch }) => {
			commit('SET_SCHEME', !state.dark)
			dispatch('SAVE_SCHEME')
		},
		
		SAVE_SCHEME: async ({ state }) => {
			sessionStorage.setItem('scheme', JSON.stringify(state.dark))
		},
	},
})


var toDoListItem = {
	data: function() {
		return {
			timer: null,
		}
	},
	mounted: function () {
		this.$nextTick(function() {
			let is = false
			let popup = this.$el.querySelector(".list__to-do__popup")
			let positionPopup = () => {
				if(!is) return
				let menuRect = this.$el.querySelector(".list__to-do__menu").getBoundingClientRect()
				let popupRect = this.$el.querySelector(".list__to-do__popup").getBoundingClientRect()

				if(document.documentElement.clientHeight - menuRect.bottom - popupRect.height < 40) {
					popup.classList.add("top")
				} else {
					popup.classList.remove("top")
				}
			}
			Tooltip({
				triger: this.$el.querySelector(".list__to-do__menu"),
				target: this.$el.querySelector(".list__to-do__popup"),
				show: () => {is = true; positionPopup()},
				hide: () => is = false,
			})
			window.addEventListener('scroll', positionPopup);
		})
	},
	props: {
		id: {
			type: String,
			reguired: true
		},
		value: {
			type: String,
			default: "",
			reguired: true
		},
		checked: {
			type: Boolean,
			default: false,
			reguired: true
		},
		listid: {
			type: String,
			reguired: true
		},
	},
	computed: {
		identifiers() {
			return {
				id: this.id,
				listid: this.listid
			}
		}
	},
	methods: {
	}
}


// Задача
Vue.component("to-do-list-item", {
	template: '#to-do-list-item',
	mixins: [toDoListItem],
	data: function() {
		return {
		}
	},
	methods: {
		changeValue(e) {
			this.updateValue({value: e})
		},
		toggleStatus() {
			this.updateValue({checked: !this.checked})
		},
		deleteItem() {
			this.$store.dispatch('DELETE_TODO_ITEM', this.identifiers)
		},
		toList() {
			this.$store.dispatch('TODO_ITEM_TO_LINK', this.identifiers)
		},
		toToDo() {
			this.$store.dispatch('TODO_ITEM_TO_TODO', this.identifiers)
		},
		updateValue(newProp) {
			this.$store.dispatch('UPDATE_TODO_ITEM', Object.assign({}, this.identifiers, newProp))
		},
	},
})


// Задача в виде ссылки на список задач 
Vue.component("to-do-list-item_link", {
	template: '#to-do-list-item_link',
	mixins: [toDoListItem],
	data: function() {
		return {
			checked: false,
		}
	},
	props: {
		link: {
			type: String,
			default: false,
			reguired: true
		},
	},
	methods: {
		changeValue(e) {
			this.$store.dispatch('UPDATE_TODO', {
				id: this.link,
				head: e
			})
		},
		go() {
			this.$store.dispatch('SET_POSITION', this.link)
		},
		deleteLink() {
			this.$store.dispatch('DELETE_TODO_ITEM', this.identifiers)
		},
		toTask() {
			this.$store.dispatch('TODO_ITEM_TO_TASK', this.identifiers)
		},
		toToDo() {
			this.$store.dispatch('TODO_ITEM_TO_TODO', this.identifiers)
		},
	},
})


// Список задач
Vue.component("to-do-list", {
	template: '#to-do-list',
	data: () => {
		return {
			newToDo: "",
			dragOverItem: "",
			dragItem: "",
			dragList: "",
			dragВirection: 0,
			countVisible: 4,
		}
	},
	props: {
		head: {
			type: String,
			default: "",
			reguired: true
		},
		list: {
			type: Array,
			default: [],
			reguired: true
		},
		id: {
			type: String,
			default: "",
			reguired: true
		},
	},
	methods: {
		changeValue(e) {
			this.$store.dispatch('UPDATE_TODO', {
				id: this.id,
				head: e
			})
		},
		addToDo() {
			if(this.newToDo == "") return

				this.$store.dispatch('ADD_TODO_ITEM', {
					listid: this.id, 
					newItem: {
						type: "task",
						value: this.newToDo,
						checked: false,
						id: this.$store.getters.CREATE_ID()
					}
				})
			
			this.newToDo = ""
		},
		deleteList() {
			this.$store.dispatch('DELETE_TODO', this.id)
		},
		deleteCheckedTask() {
			this.list.forEach(item => {
				if(item.checked) {
					this.$store.dispatch('DELETE_TODO_ITEM', {
						id: item.id,
						listid: this.id
					})
				}
			})
		},
		deleteAllTask() {
			this.list.forEach(item => {
				this.$store.dispatch('DELETE_TODO_ITEM', {
					id: item.id,
					listid: this.id
				})
			})
		},
		fixing() {
			this.$store.dispatch('SET_FIXED', this.fixed == this.id ? "" : this.id)
		},
		showAll() {
			this.countVisible = Infinity
		},
		onItemMoved(e) {
			let indexEnd = this.list.findIndex(item => item.id == e.end)
			let indexTo = this.list.findIndex(item => item.id == e.to)
			this.list.splice(indexTo, 0, ...this.list.splice(indexEnd, 1))
			this.$store.dispatch('UPDATE_TODO', {
				id: this.id,
				list: this.list
			})
		},
		onDragOver(e) {
			this.dragOverItem = e.over
			this.dragItem = e.target
			this.dragList = e.list
			
			let i1 = this.list.findIndex(e => e.id == this.dragOverItem)
			let i2 = this.list.findIndex(e => e.id == this.dragItem)
			
			if(i1 != -1 && i2 != -1) {
				if(i1 > i2) {
					this.dragВirection = -1
				} else {
					this.dragВirection = 1
				}
			} else {
				this.dragВirection = 0
			}
		},
		onDragLeave(e) {
			let relatedTarget = e.relatedTarget

			if(e.relatedTarget.nodeType == 3) relatedTarget = e.relatedTarget.parentElement
			if(!e.relatedTarget || !this.$el.querySelector(".to-do-list__body").contains(relatedTarget)) {
				this.dragВirection = 0
				this.dragOverItem = ""
				this.dragItem = ""
				this.dragList = ""
			}
		},
		isDragOver(itemId) {
			return itemId == this.dragOverItem && this.id == this.dragList && this.dragItem != this.dragOverItem
		},
	},
	computed: {
		...Vuex.mapState({
			fixed: "fixed",
		}),
		progress() {
			return Math.ceil(this.$store.getters.PROGRESS_TODOS([{list:this.list}]) * 100) + "%";
		},
		lengthCheckedTask() {
			return this.list.filter(e => e.checked).length
		},
	},
})



// Перетаскиваемый элемент списка

Vue.component("drag-item", {
	template: '#drag-item',
	data: function() {
		return {
			disabledInput: true,
		}
	},
	props: {
		task: {
			type: Array,
			default: [],
			reguired: true
		},
		listid: {
			type: String,
			reguired: true
		},
	},
	methods: {
		onDragStart(e) {
			e.dataTransfer.dropEffect = "move";
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/html', e.target.innerHTML);
			e.dataTransfer.setData('text', JSON.stringify({id: this.task.id, list:this.listid}))
		},
		upDragOver(e) {
			this.$emit('itemdragover', {
				over: this.task.id,
				target: JSON.parse(e.dataTransfer.getData('text')).id,
				list: JSON.parse(e.dataTransfer.getData('text')).list,
			})
		},
		onDrop(e) {
			this.$emit('itemdragover', {
				over: "",
				target: "",
				list: "",
			})
			
			let data = JSON.parse(e.dataTransfer.getData('text'))
			this.$emit('itemmoved', {
				to: this.task.id,
				end: data.id
			})
		},
	},
})



// Поле ввода на основе contentEditable

Vue.component("user-input", {
	template: '#user-input',
	data: function() {
		return {
			disabled: true,
			timer: null,
			visibilityPlaceholder: false,
		}
	},
	props: {
		value: {
			type: String,
			reguired: true
		},
	},
	methods: {
		blur(e) {
			this.disabled = true

			if(e.target.textContent == "") {
				e.target.textContent = this.value
			} else {
				this.$emit('change-value', e.target.textContent)
			}
		},
		edit(e) {
			if (this.timer == null) {
				this.timer = setTimeout(() => {
					// click
					
					this.timer = null
					
					if(this.disabled) this.$emit('click', e)
				}, 200);
			} else {
				// dblclick
				
				clearTimeout(this.timer)
				this.timer = null
				this.disabled = false
				
				var range = document.createRange()
				range.selectNodeContents(this.$el)
				window.getSelection().addRange(range)

				setTimeout(() => this.$el.focus(), 0)
			}
		},
		onKeydown(e) {
			if(e.key && e.key.length == 1) this.visibilityPlaceholder = false

			// Блокируем Enter
			if (e.code == 'KeyV' && (e.ctrlKey || e.metaKey) 
				|| e.code == 'Enter' || e.code == 'NumpadEnter') {
				e.preventDefault();
			}
		},
		remove(e) {
			if(e.target.textContent.length == 1) this.visibilityPlaceholder = true
			if(e.target.textContent != "") return
			this.$emit('remove', e)
		},
	},
	watch: {
		disabled() {
			this.$emit('disabled-input', this.disabled)
		},
	}
})



// Окружить значение скобками: (*)

Vue.filter("surround", function (value) {
	return value ? ` (${value})` : ""
})



// Перетаскиваемый элемент списка

Vue.component("core-app", {
	template: '#core-app',
	data: function() {
		return {
		}
	},
	mounted() {
		this.$store.dispatch('GET_DATA')
	},
	methods: {
		addToDoList() {
			this.$store.dispatch('ADD_TODO')
		},
		getHecked() {
			return this.displayedToDoList.reduce((indices, e) => {
				let i = e.list.findIndex(i => !i.checked)
				if(e.list.length && i == -1) indices.push(e)
					return indices
			}, [])
		},
		deleteHecked() {
			this.getHecked().forEach(e => {
				this.$store.dispatch('DELETE_TODO', e.id)
			})
		},
		toggleScheme() {
			this.$store.dispatch('TOGGLE_SCHEME')
		},
		back() {
			this.$store.dispatch('BACK_POSITION')
		},
	},
	computed: {
		...Vuex.mapGetters({
			displayedToDoList: "TODOS",
		}),
		...Vuex.mapState({
			dark: "dark",
			position: "position",
		}),
		lenghtTODOS() {
			return this.displayedToDoList.length
		},
		progress() {
			let progress = this.$store.getters.PROGRESS_TODOS(this.$store.state.toDoList)
			return Math.ceil(progress * 100) + "%";
		},
		lengthDeleteHecked() {
			return this.getHecked().length
		},
		backName() {
			let b = this.$store.getters.TODO_BY_ID(this.position[this.position.length - 2])
			return b ? b.head : "Home"
		},
	},
	watch: {
		dark() {
			if(this.dark){
				document.body.classList.add("dark")
			} else {
				document.body.classList.remove("dark")
			}
		},
	}
})

new Vue({
	el: "#app", 
	store,
})

