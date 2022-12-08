#ifndef UTIL_H
#define UTIL_H

#include <stdlib.h>
#include <string.h>

typedef struct
{
    unsigned long size;
    unsigned long element_size;
    void** elements;
} Array;

typedef struct sListElement
{
    void* data;
    struct sListElement* next;
    struct sListElement* prev;
} ListElement;

typedef struct 
{
    unsigned long size;
    Array* elements;
    ListElement* head;
    ListElement* tail;
} List;

Array* create_array(unsigned long size, unsigned long element_size);
void* array_get(Array* array, unsigned long index);
int array_set(Array* array, unsigned long index, void* element);
int array_remove(Array* array, unsigned long index);
int array_resize(Array* array, unsigned long new_size);
void delete_array(Array* array);

List* create_list();
void list_append(List* list, void* element);
void* list_get(List* list, unsigned long index);
int list_includes(List* list, void* element);
int list_remove(List* list, unsigned long index);
void list_clear(List* list);
void delete_list(List* list);

#endif