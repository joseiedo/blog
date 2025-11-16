---
title: I changed my vision about code design
description: ""
date: 2025-04-02
tags:
  - code-design
image: ""
draft: false
authors:
  - iedo
---
After almost 2 years at the same project I learned a lot about the impact of my old code. Facing the consequences of my decisions were and still is frustrating.
I had some feelings:
- I should've followed some Design Pattern since the beginning and made a modular code! 
- I should've followed a Modular Architecture!
But when I applied something like that, the code was complex and looked like a pile of overengineering, so I started to look a lot to open source projects and follow some different programming teachers.

Here is some strange things that I learned:
## Using Repositories in a Controller

>_What the hell is that? Repositories must be in a Service! Controllers should handle just http things!

This was my reaction when I saw Rafael Ponte posting [this](https://www.linkedin.com/feed/update/urn:li:activity:7138576506527674368/) on LinkedIn, then I just scrolled and forgot about it.
After almost a year, I watched some lessons from Alberto Souza, where he put emphazis on not being attached to "book practices" and analyze, experiment and have your own conclusions.

Now, C'mon! Look at this code:
```kotlin
class UserService constructor(
    private val userRepository: UserRepository,
    private val userMapper: UserMapper
) {

    fun updateUser(id: Long, userDTO: UserDTO): UserDTO? {
		val existingUser = userRepository.findById(id) ?: throw NotFoundException() // Global ExceptionHandler would handle this
        val updatedUser = userRepository.save(userMapper.toEntity(userDTO))
	    return UserMapper.toDTO(updatedUser)
    }
}

class UserController constructor(
    private val userService: UserService
) {

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun updateUser(@PathVariable id: Long, @RequestBody userDTO: UserDTO): ResponseEntity<UserDTO> {
        return userService.updateUser(id, userDTO)
    }
}
```

What the controller or service is doing here that is complex enough to force myself to create another layer of abstraction? Am I getting any advantage?
Ok..single responsability principle, controllers must deal only with the http codes etc. But honestly, it is that worth to abstract to a service? Let's ignore the "rules" of Uncle bob and just have our own conclusions

Here is the same code without using the service class:

```kotlin
class UserController constructor(
    private val userRepository: UserRepository,
) {

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    fun updateUser(@PathVariable id: Long, @RequestBody userDTO: UserDTO): ResponseEntity<UserDTO> {
        val existingUser = userRepository.findById(id) ?: throw NotFoundException() // Global ExceptionHandler would handle this
        val updatedUser = userRepository.save(userMapper.toEntity(userDTO))
	    return UserMapper.toDTO(updatedUser)
    }
}
```

I don't think this code is that complex. And if things become complex enough, it's really easy to refactor to a new class. With intellij is just a matter of remembering the shortcuts.
## Adding business rules in the model 

> But the rules should be in the services...?

This one is about cohesion, and is a very famous pattern called Rich Domains.
It's also a matter about following the OOP principles. Let's look at this code:
```kotlin
@Service
class UserService @Autowired constructor(
    private val userRepository: UserRepository
) {
    fun updateUser(id: Long, userDTO: UserDTO): UserDTO? {
        val existingUser = userRepository.findById(id).orElse(null) ?: return null

        // Business logic is handled in the service
        existingUser.name = userDTO.name
        existingUser.email = userDTO.email
        existingUser.age = userDTO.age

        val updatedUser = userRepository.save(existingUser)
        return UserMapper.toDTO(updatedUser)
    }
}
```

We can refactor our code and make the service only an "orchestrator"
```kotlin

@Entity
data class User(
    @Id
    val id: Long,
    var name: String,
    var email: String,
    var age: Int
) {
    fun updateDetails(name: String, email: String, age: Int) {
        // Business logic encapsulated within the domain entity
        this.name = name
        this.email = email
        this.age = age
    }
}

class UserService @Autowired constructor(
    private val userRepository: UserRepository
) {
    fun updateUser(id: Long, userDTO: UserDTO): UserDTO? {
        val existingUser = userRepository.findById(id).orElse(null) ?: return null
existingUser.updateDetails()
        return UserMapper.toDTO(updatedUser)
    }
}
```
## Conclusion
When I started studying design patterns, I had a bad time understanding **when** should I use some pattern, the explanations were so vague and the code was complex. (This was worse when I studied a bit about clean architecture, but I'm going to write another post about that later)

At the end, there is no perfect code. The clean code thing is a lie and all we can do is try to have a gradual evolution in our code. I'm still learning how to do that, and I hope I can do it soon.
Let's see how my opinion will change in the next years.
