apiVersion: skaffold/v2alpha3
kind: Config
deploy:
    kubectl:
        manifests:
            - ./infra/k8s/*
            - ./infra/k8s-prod/*
build:
  local:
    push: false
  artifacts:
      - image: angrygoose/auth
        context: auth
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
              - src: 'src/**/*.ts'
                dest: .
      - image: angrygoose/client
        context: client
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
              - src: '**/*.js'
                dest: .
      - image: angrygoose/tickets
        context: tickets
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
              - src: 'src/**/*.ts'
                dest: .
      - image: angrygoose/orders
        context: orders
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
              - src: 'src/**/*.ts'
                dest: .
      - image: angrygoose/expiration
        context: expiration
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
            - src: 'src/**/*.ts'
              dest: .
      - image: angrygoose/payments
        context: payments
        docker: 
          dockerfile: Dockerfile
        sync:
          manual:
            - src: 'src/**/*.ts'
              dest: .