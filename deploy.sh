cd "$(dirname "$0")"

yarn run build

aws s3 cp \
    --recursive ./build/ \
    s3://gdn-cdn/libs/acquisition-iframe-tracking/ \
    --acl public-read \
    --profile interactives
