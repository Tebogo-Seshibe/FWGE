import { type Component, type ComponentId, type TypeId } from "./Component";
import { Entity, type EntityId } from "./Entity";
import { ListContainer } from "./ListContainer";
import { Type, type Class } from "./Class";

export type View = EntityId[];
export type ViewKey = number;
export type ViewFilter<T extends readonly any[] = readonly any[]> = (enity: Entity, ...args: T) => boolean;
export type ViewConfig =
{ 
    componentTypes: readonly Class<Component>[],
    filter: ViewFilter 
};
export type ViewIteratorValue<E extends Entity, T extends Component[]> = 
{
    done: false,
    value: [E, ...T]
} | {
    done: true,
    value: undefined
};
export type ViewIterator<E extends Entity, T extends Component[]> = 
{
    [Symbol.iterator]():
    {
        next(): ViewIteratorValue<E, T>
    }
};

// export type ViewGroup<T extends any[] = any[]> = (...args: T) => ComponentId;
// export type Group<
//     Depth extends number,
//     Count extends unknown[] = FixedLengthArray<number, Depth>
// > = 
//     Count['length'] extends 0 
//     ? EntityId[]
//     : Map<ComponentId, Group<Depth, Tail<Count>>
// >;

export type EntityEntry =
{
    entity: Entity;
    parent: EntityId;
    children: EntityId[];
}

export class Registry
{
    //#region Properties
    private static readonly entityGraph: (EntityEntry | undefined)[] = [];
    private static readonly componentTypes: Class<Component>[] = [];
    private static readonly componentListContainers: ListContainer<Component>[] = [];
    private static readonly entityComponentList: ListContainer<(Component | undefined)[]> = new ListContainer<(Component | undefined)[]>();

    private static readonly views: ListContainer<View> = new ListContainer<View>();
    private static readonly viewConfig: ViewConfig[] = [];
    private static readonly mappedViews: number[][] = [];

    public static readonly ExistFilter: ViewFilter<[Component]> = () => true;
    //#endregion

    //#region Entity
    public static CreateEntity<T extends Entity = Entity>(entity: T): EntityId
    {
        const entityId = this.entityComponentList.Add([]);
        this.entityGraph[entityId] = {
            entity: entity,
            children: [],
            parent: -1,
        };

        return entityId;
    }

    public static GetEntity<T extends Entity = Entity>(entityId: EntityId): T | undefined
    {
        return this.entityGraph[entityId]?.entity as T;
    }

    public static GetEntities<T extends Entity = Entity>(entityType: Type<T>): readonly T[]
    {
        const entities: T[] = [];

        for (let i = 0; i < this.entityGraph.length; ++i)
        {
            if (this.entityGraph[i]?.entity instanceof entityType)
            {
                entities.push(this.entityGraph[i]!.entity as T);
            }
        }
        
        return entities;

    }

    public static IsEntityActive(entityId: EntityId): boolean
    {
        return this.GetEntity(entityId)?.Active ?? false;
    }

    public static AddChild(parentId: EntityId, childId: EntityId): void
    {
        const parent = this.entityGraph[parentId];
        const child = this.entityGraph[childId];

        if (!parent || !child)
        {
            return;
        }

        if (!parent.children.includes(childId))
        {
            parent.children.push(childId)
        }

        child.parent = parentId;
    }
    
    public static GetChild(parentId: EntityId, childId: EntityId): Entity
    {
        const childrenList = this.entityGraph[parentId]?.children ?? [];

        return this.entityGraph[childrenList[childId]]!.entity!;
    }
    
    public static GetParent(childId: EntityId): Entity | undefined
    {
        return this.entityGraph[this.entityGraph[childId]!.parent]?.entity;
    }
    
    public static GetParentId(childId: EntityId): EntityId
    {
        return this.entityGraph[childId]?.parent ?? -1;
    }
    
    public static GetChildren(entityId: EntityId): readonly Entity[]
    {
        const children: Entity[] = [];
        const childrenList = this.entityGraph[entityId]?.children ?? [];

        for (let i = 0; i < childrenList.length; ++i)
        {
            children.push(this.entityGraph[childrenList[i]]!.entity!);
        }
        
        return children;
    }

    public static GetChildrenIds(entityId: EntityId): readonly EntityId[]
    {
        const children: EntityId[] = [];
        const childrenList = this.entityGraph[entityId]?.children ?? [];

        for (let i = 0; i < childrenList.length; ++i)
        {
            children.push(childrenList[i]);
        }
        
        return children;
    }

    public static RemoveChild(parentId: EntityId, childId: EntityId): void
    {
        const parent = this.entityGraph[parentId];
        const child = this.entityGraph[childId];

        if (parent)
        {   
            const childIndex = parent.children.indexOf(childId);
            
            if (childIndex !== -1)
            {
                parent.children[childIndex] = parent.children[parent.children.length - 1];
                parent.children.pop();
            }
        }

        if (child)
        {
            child.parent = -1;
        }
    }

    public static DestroyEntity(entityId: EntityId): void
    {
        const entity = this.entityGraph[entityId];
        this.entityGraph[entityId] = undefined;

        if (!entity)
        {
            return;
        }

        for (let i = 0; i < entity.children.length; ++i)
        {
            const child = this.entityGraph[entity.children[i]];

            if (child)
            {
                child.parent = -1;
            }
        }
    }
    //#endregion

    //#region Component
    public static CreateComponent(componentTypeId: TypeId, component: Component): ComponentId
    {
        return this.componentListContainers[componentTypeId].Add(component);
    }

    public static AddComponent(entityId: EntityId, component: Component): void
    {
        const entityList = this.entityComponentList.Get(entityId);
        
        if (!entityList)
        {
            throw new Error('Attempted to add component to invalid entity id');
        }
        
        entityList[component.TypeId] = component;
        
        const possibleViews = this.mappedViews[component.TypeId] ?? [];
        for (let i = 0; i < possibleViews.length; ++i)
        {
            const view = this.views.Get(possibleViews[i])!;
            const config = this.viewConfig[possibleViews[i]];
            
            if (view.includes(entityId))
            {
                continue;
            }

            if (this.testValidViewEntity(entityId, config.componentTypes, config.filter))
            {
                view.push(entityId);
            }
        }
        this.mappedViews[component.TypeId] = possibleViews;
    }

    public static GetComponent<T extends Component = Component>(entityId: EntityId, componentTypeId: TypeId): T | undefined
    public static GetComponent<T extends Component = Component>(entityId: EntityId, componentType: Class<T>): T | undefined
    public static GetComponent<T extends Component = Component>(entityId: EntityId, componentTypeOrId: TypeId | Class<T>): T | undefined
    {
        const typeId = typeof componentTypeOrId === 'number'
            ? componentTypeOrId
            : componentTypeOrId.TypeId
        const entityList = this.entityComponentList.Get(entityId);

        if (entityList)
        {
            return entityList[typeId] as T;
        }

        return undefined;

    }

    public static HasComponent(entityId: EntityId, componentTypeId: TypeId): boolean
    {
        const entityList = this.entityComponentList.Get(entityId);

        if (entityList)
        {
            return entityList[componentTypeId] !== undefined;
        }

        return false;

    }

    public static RemoveComponent(entityId: EntityId, componentTypeId: TypeId): void
    {
        const entityList = this.entityComponentList.Get(entityId);
        
        if (entityList)
        {
            entityList[componentTypeId] = undefined;
        }

        const possibleViews = this.mappedViews[componentTypeId] ?? [];
        for (let i = 0; i < possibleViews.length; ++i)
        {
            const view = this.views.Get(possibleViews[i])!;
            const index = view.indexOf(entityId);

            if (index === -1)
            {
                continue;
            }

            view[index] = view[view.length - 1];
            view.pop();
        }
        this.mappedViews[componentTypeId] = possibleViews;
    }
    //#endregion

    //#region Component Type
    public static RegisterComponentType(componentType: Class<Component>): void
    {
        (componentType as any).TypeId = this.componentTypes.length;
        this.componentListContainers[componentType.TypeId] = new ListContainer(1);
        this.componentTypes.push(componentType);
    }

    public static GetRegisteredComponentType(componentTypeId: TypeId): Class<Component>
    {
        return this.componentTypes[componentTypeId];
    }

    public static GetRegisteredComponentTypes(): readonly Class<Component>[]
    {
        return this.componentTypes;
    }
    //#endregion

    //#region View
    public static RegisterView<T1 extends Component>(componentTypes: readonly [Class<T1>]): ViewKey
    public static RegisterView<T1 extends Component>(componentTypes: readonly [Class<T1>], filter: ViewFilter<[T1]>): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>]): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>], filter: ViewFilter<[T1, T2]>): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component, T3 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>, Class<T3>]): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component, T3 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>, Class<T3>], filter: ViewFilter<[T1, T2, T3]>): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component, T3 extends Component, T4 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>, Class<T3>, Class<T4>]): ViewKey
    public static RegisterView<T1 extends Component, T2 extends Component, T3 extends Component, T4 extends Component>(componentTypes: readonly [Class<T1>, Class<T2>, Class<T3>, Class<T4>], filter: ViewFilter<[T1, T2, T3, T4]>): ViewKey
    public static RegisterView<T extends Component[]>(componentTypes: readonly Class<T[number]>[], filter: ViewFilter<T[number][]> = () => true): ViewKey
    {
        const entityIds: View = [];
        const currentEntityIds: View = [];
        const entities = this.entityComponentList.Items;

        for (let i = 0; i < entities.length; ++i)
        {
            if (entities[i] !== undefined)
            {
                currentEntityIds.push(i);
            }
        }

        for (let i = 0; i < currentEntityIds.length; ++i)
        {
            if (this.testValidViewEntity(currentEntityIds[i], componentTypes, filter))
            {
                entityIds.push(currentEntityIds[i]);
            }
        }
        
        const key = this.views.Add(entityIds);
        this.viewConfig[key] = { componentTypes, filter };

        for (const componentType of componentTypes)
        {
            if (componentType.TypeId === undefined)
            {
                this.RegisterComponentType(componentType);
            }
            
            if (!this.mappedViews[componentType.TypeId])
            {
                this.mappedViews[componentType.TypeId] = [];
            }
            this.mappedViews[componentType.TypeId].push(key);
        }

        return key;
    }

    public static GetView(key: ViewKey): readonly EntityId[]
    {
        return this.views.Get(key) ?? [];
    }
    
    public static GetViewIterator<E extends Entity, T1 extends Component>(key: ViewKey, componentTypes: readonly [Class<T1>]): ViewIterator<E, [T1]>
    public static GetViewIterator<E extends Entity, T1 extends Component, T2 extends Component>(key: ViewKey, componentTypes: readonly [Class<T1>, Class<T2>]): ViewIterator<E, [T1, T2]>
    public static GetViewIterator<E extends Entity, T1 extends Component, T2 extends Component, T3 extends Component>(key: ViewKey, componentTypes: readonly [Class<T1>, Class<T2>, Class<T3>]): ViewIterator<E, [T1, T2, T3]>
    public static GetViewIterator<E extends Entity, T extends Component[]>(key: ViewKey, componentTypes: readonly Class<T[number]>[]): ViewIterator<E, T>
    {
        const elements: [Entity, ...Component[]] = new Array(componentTypes.length + 1) as [E, ...T];
        const view = Registry.GetView(key);
        let index = 0;
        
        return {
            [Symbol.iterator]: function() {
                
                return {
                    next: (): ViewIteratorValue<E, T> => {
                        if (index >= view.length)
                        {
                            return { done: true, value: undefined };
                        }

                        elements[0] = Registry.GetEntity<E>(view[index])!;
                        for (let i = 0; i < componentTypes.length; ++i)
                        {
                            elements[i + 1] = Registry.GetComponent(view[index], componentTypes[i].TypeId)!;
                        }

                        index++;
                        return { done: false, value: elements as [E, ...T] };
                    }
                }
            }
        }
    }
    //#endregion

    //#region Group
    public static RegisterGroup<T1 extends Component, T2 extends Component>(
        components: readonly [Class<T1>, Class<T2>]
    ): ViewKey
    public static RegisterGroup<T1 extends Component, T2 extends Component>(
        components: readonly [Class<T1>, Class<T2>],
        filter1: ViewFilter<[T1]>,
        filter2: ViewFilter<[T2]>
    ): ViewKey
    
    public static RegisterGroup<T1 extends Component, T2 extends Component, T3 extends Component>(
        components: readonly [Class<T1>, Class<T2>, Class<T3>]
    ): ViewKey
    public static RegisterGroup<T1 extends Component, T2 extends Component, T3 extends Component>(
        components: readonly [Class<T1>, Class<T2>, Class<T3>],
        filter1: ViewFilter<[T1]>,
        filter2: ViewFilter<[T2]>,
        filter3: ViewFilter<[T3]>
    ): ViewKey

    public static RegisterGroup<T extends Component[]>(...args:any[]): ViewKey
    {        
        const key = this.views.Add([]);

        return key;
    }    
    //#endregion

    //#region Utils
    private static testValidViewEntity(entityId: EntityId, componentTypes: readonly Class<Component>[], filter: ViewFilter): boolean
    {
        const components: Component[] = [];

        for (let i = 0; i < componentTypes.length; ++i)
        {
            if (!this.HasComponent(entityId, componentTypes[i].TypeId!))
            {
                return false
            }
            
            components.push(this.GetComponent(entityId, componentTypes[i].TypeId!)!);
        }

        return filter.apply(undefined, [this.GetEntity(entityId), ...components]);
    }
    //#endregion
}
