#include "util.h"

static unsigned int DEFAULT_SIZE = 16;

/* Implementation of an Array */
Array* create_array(unsigned long size, unsigned long element_size)
{
    Array* array = (Array*) malloc(sizeof(Array));
    array->size = size;
    array->element_size = element_size;
    array->elements = malloc(array->size * array->element_size);

    if (!array || !array->elements) return NULL;

    return array;
}

void* array_get(Array* array, unsigned long index)
{
    if (index >= array->size) return NULL;

    return array->elements[index];
}

int array_set(Array* array, unsigned long index, void* element)
{
    if (index >= array->size) return 1;

    array->elements[index] = element;

    return 0;
}

int array_remove(Array* array, unsigned long index)
{
    if (index >= array->size) return 1;

    array->elements[index] = NULL;

    return 0;
}

int array_resize(Array* array, unsigned long new_size)
{
    array->size = new_size;
    array->elements = realloc(array->elements, array->size * array->element_size);
    if (!array->elements) return 1;
    return 0;
}

void delete_array(Array* array)
{
    free(array->elements);
    free(array);
}

/* Implementation of a List */

List* create_list()
{
    List* list = (List*) malloc(sizeof(List));
    list->size = 0;
    list->elements = create_array(DEFAULT_SIZE, sizeof(void*));
    list->head = NULL;
    list->tail = NULL;
    return list;
}

void list_append(List* list, void* element) 
{
    ListElement* new_list_element = (ListElement*) malloc(sizeof(ListElement));
    new_list_element->data = element;
    unsigned long index = list->size;

    if (list->size++ == list->elements->size)
    {
        array_resize(list->elements, list->elements->size * 2);
    }

    if (list->tail != NULL)
    {
        list->tail->next = new_list_element;
        new_list_element->prev = list->tail;
        new_list_element->next = NULL;
        list->tail = new_list_element;
    }
    else
    {
        new_list_element->prev = NULL;
        new_list_element->next = NULL;
        list->tail = new_list_element;
        list->head = new_list_element;
    }

    array_set(list->elements, index, new_list_element);
}

void* list_get(List* list, unsigned long index)
{
    if (index >= list->size) return NULL;

    return ((ListElement*) array_get(list->elements, index))->data;
}

int list_includes(List* list, void* element)
{
    ListElement* list_element = list->head;
    while (list_element != NULL)
    {
        if (list_element->data == element) return 0;
        list_element = list_element->next;
    }
    return 1;
}

int list_remove(List* list, unsigned long index)
{
    if (index >= list->size) return 1;

    list->size--;
    ListElement* to_remove = (ListElement*) array_get(list->elements, index);

    if (to_remove->next && to_remove->prev) 
    {
        to_remove->prev->next = to_remove->next;
        to_remove->next->prev = to_remove->prev;
    }
    else if (to_remove->prev)
    {
        to_remove->prev->next = NULL;
        list->tail = to_remove->prev;
    }
    else if (to_remove->next)
    {
        to_remove->next->prev = NULL;
        list->head = to_remove->next;
    }
    else 
    {
        list->head = NULL;
        list->tail = NULL;
    }

    if (to_remove->next)
    {
        memcpy(&list->elements->elements[index], &list->elements->elements[index+1], (list->size-index) * sizeof(ListElement*));
        array_set(list->elements, list->size, NULL);
    }

    free(to_remove);

    return 0;
}

void list_clear(List* list)
{
    ListElement* curr = list->tail;
    if (!curr) return;

    while (curr->prev)
    {
        curr = curr->prev;
        free(curr->next);
    }

    free(curr);
}

void delete_list(List* list)
{
    list_clear(list);
    delete_array(list->elements);
    free(list);
}